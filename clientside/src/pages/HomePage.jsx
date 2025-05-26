import React, { useEffect, useState } from 'react';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import postsService from '../services/postsService';
import { useAuth } from '../hooks/useAuth';
import { Button, Dialog, CircularProgress, Box, Typography, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

export default function HomePage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postsService.getAllPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenForm = () => setOpenAddForm(true);
  const handleCloseForm = () => setOpenAddForm(false);

  const handleAddSuccess = () => {
    toast.success('Post created successfully!');
    fetchPosts();
    handleCloseForm();
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
    toast.success('Post updated successfully!');
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prevPosts =>
      prevPosts.filter(post => post._id !== deletedPostId)
    );
    toast.success('Post deleted successfully!');
  };

 const handleLike = async (postId) => {
  if (!user || !token) {
    toast.warning('You need to be logged in to like posts.');
    return;
  }

  try {
    const userId = user._id || user.id;

    setPosts(prev =>
      prev.map(post => {
        if (post._id !== postId) return post;

        const hasLiked = post.reactions?.some(
          reaction => (reaction.user === userId || reaction.user?._id === userId) && reaction.type === 'like'
        );

        let updatedReactions;
        if (hasLiked) {
          updatedReactions = post.reactions.filter(
            r => !((r.user === userId || r.user?._id === userId) && r.type === 'like')
          );
        } else {
          updatedReactions = [
            ...(post.reactions || []), 
            { 
              user: userId, 
              type: 'like', 
              _id: `temp_${Date.now()}` 
            }
          ];
        }

        return { ...post, reactions: updatedReactions };
      })
    );

    const updatedPost = await postsService.likePost(postId, token, userId);
    
    setPosts(prev =>
      prev.map(post =>
        post._id === postId ? updatedPost : post
      )
    );

  } catch (err) {
    console.error('Failed to like post', err);
    toast.error('Failed to update like');
    fetchPosts();
  }
};

  const handleShare = async (postId) => {
    try {
      await postsService.sharePost(postId);
      toast.success('Post shared successfully!');
      fetchPosts();
    } catch (err) {
      console.error('Failed to share post', err);
      toast.error('Failed to share post');
    }
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: 2, position: 'relative', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home
      </Typography>

      {user && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenForm}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && posts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No posts available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to create a post!
          </Typography>
        </Box>
      )}

      {!loading && posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
          onLike={handleLike}
          onShare={handleShare}
        />
      ))}

      <Dialog
        open={openAddForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <PostForm
          onClose={handleCloseForm}
          onSuccess={handleAddSuccess}
        />
      </Dialog>
    </Box>
  );
}
