/* eslint-disable no-unused-vars */
import api from "/src/services/api.js";

const uploadImage = async (image) => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    const response = await api.post('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.url;
  } catch (err) {
    throw new Error('Failed to upload image');
  }
};

const postsService = {
  getAllPosts: async () => {
    const response = await api.get('/posts/all');
    return response.data;
  },

  getMyPosts: async () => {
    const response = await api.get('/posts/my-posts');
    return response.data;
  },

  getUserPosts: async () => {
    const response = await api.get('/posts/my-posts');
    return response.data;
  },

   getPostsByUserId: async (id) => {
    try {
      const response = await api.get(`/posts/user/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get post');
    }
  },

  

  createPost: async (postData) => {
    try {
      let imageUrl = '';

      if (postData.image && postData.image instanceof File) {
        imageUrl = await uploadImage(postData.image);
      }

      const response = await api.post('/posts', {
        title: postData.title,
        description: postData.description,
        imageUrl
      });

      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create post');
    }
  },

  updatePost: async (id, postData) => {
    try {
      const payload = {
        title: postData.title,
        description: postData.description,
      };

      if (postData.image && postData.image instanceof File) {
        const imageUrl = await uploadImage(postData.image);
        payload.imageUrl = imageUrl;
      } else if (postData.image === null) {
        payload.imageUrl = null;
      }

      const response = await api.put(`/posts/${id}`, payload);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update post');
    }
  },

  deletePost: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete post');
    }
  },

 likePost: async (postId, token, userId) => {
  try {
    // أولاً نجلب الـ post الحالي لنرى حالة الـ like
    const currentPost = await api.get(`/posts/${postId}`);
    
    // نتحقق إذا كان المستخدم قد عمل like من قبل
    const existingReaction = currentPost.data.reactions?.find(
      reaction => reaction.user === userId && reaction.type === 'like'
    );

    if (existingReaction) {
      // إذا كان موجود، نحذف الـ like (unlike)
      await api.delete(`/reactions/${existingReaction._id}`);
    } else {
      // إذا لم يكن موجود، نضيف like جديد
      await api.post('/reactions', {
        user: userId,
        post: postId,
        type: 'like'
      });
    }

    // نجلب الـ post المحدث بعد التعديل
    const updatedPostResponse = await api.get(`/posts/${postId}`);
    return updatedPostResponse.data;

  } catch (err) {
    console.error('Like post error:', err);
    throw new Error(err.response?.data?.message || 'Failed to toggle like');
  }
},

getPostById: async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to get post');
  }
},

  // Updated comment methods to work with your backend
  addComment: async (postId, commentData) => {
    try {
      const response = await api.post('/comments', {
        content: commentData.content || commentData.text,
        post: postId
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add comment');
    }
  },

  getCommentsByPost: async (postId) => {
    try {
      const response = await api.get(`/comments/post/${postId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get comments');
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete comment');
    }
  },

  sharePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/share`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to share post');
    }
  },



  getSharedPostsByUserId: async (userId) => {
    try {
      const response = await api.get(`/posts/shared/${userId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get post');
    }
  },

 getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'User not found');
    }
  }

};

export default postsService;