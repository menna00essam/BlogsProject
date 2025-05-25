import React from 'react';
import PostForm from '../components/posts/PostForm';
import { useNavigate } from 'react-router-dom';
import postsService from '../services/postsService';
import { toast } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css'; 

export default function CreatePostPage() {
  const navigate = useNavigate();

  const handleCreate = async (newPost) => {
    try {
      await postsService.createPost(newPost);
      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create Post</h1>
      <PostForm onSubmit={handleCreate} />
    </div>
  );
}
