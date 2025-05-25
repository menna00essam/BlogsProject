import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/posts/PostForm';
import postsService from '../services/postsService';
import { toast } from 'react-toastify';  // استيراد toast من react-toastify
import 'react-toastify/dist/ReactToastify.css'; // استيراد CSS

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const posts = await postsService.getAllPosts();
        const foundPost = posts.find(p => p._id === id);
        if (!foundPost) {
          toast.error('Post not found!');
          navigate('/');
          return;
        }
        setPost(foundPost);
      } catch (error) {
        toast.error('Failed to load post.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleUpdate = async (updatedPost) => {
    try {
      await postsService.updatePost(id, updatedPost);
      toast.success('Post updated successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to update post.');
      console.error(error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <PostForm 
        post={post} 
        onSubmit={handleUpdate} 
        onClose={() => navigate('/')} 
      />
    </>
  );
}
