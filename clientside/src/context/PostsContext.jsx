/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import postsService from '../services/postsService';
import { useAuth } from '../hooks/useAuth';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, token } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsService.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserPosts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await postsService.getUserPosts();
      setUserPosts(data);
    } catch (err) {
      console.error('Failed to load user posts', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPosts();
    }
  }, [isAuthenticated, fetchUserPosts]);

  const createPost = async (postData) => {
    setLoading(true);
    try {
      const newPost = await postsService.createPost(postData);
      setPosts(prev => [newPost, ...prev]);
      setUserPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError('Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id, postData) => {
    setLoading(true);
    try {
      const updatedPost = await postsService.updatePost(id, postData);
      setPosts(prev => prev.map(post => post._id === id ? updatedPost : post));
      setUserPosts(prev => prev.map(post => post._id === id ? updatedPost : post));
      return updatedPost;
    } catch (err) {
      setError('Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    setLoading(true);
    try {
      await postsService.deletePost(id);
      setPosts(prev => prev.filter(post => post._id !== id));
      setUserPosts(prev => prev.filter(post => post._id !== id));
    } catch (err) {
      setError('Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const updatedPost = await postsService.likePost(postId, token, user._id);
      setPosts(prev => prev.map(post => post._id === postId ? updatedPost : post));
      setUserPosts(prev => prev.map(post => post._id === postId ? updatedPost : post));
      return updatedPost;
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

 const addComment = async (postId, commentData) => {
    try {
      const newComment = await postsService.addComment(postId, commentData);
      
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [newComment, ...(post.comments || [])]
            };
          }
          return post;
        })
      );
      
      return newComment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      await postsService.deleteComment(commentId);
      
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: (post.comments || []).filter(comment => comment._id !== commentId)
            };
          }
          return post;
        })
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

 const sharePost = async (postId) => {
  try {
    const sharedPost = await postsService.sharePost(postId);
    setPosts(prev => [sharedPost, ...prev]); 
    return sharedPost;
  } catch (err) {
    console.error('Failed to share post', err);
  }
};


  const value = {
    posts,
    userPosts,
    loading,
    error,
    fetchPosts,
    fetchUserPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    sharePost,
    deleteComment,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};
