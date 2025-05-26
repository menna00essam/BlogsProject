import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import PostCard from '../components/posts/PostCard';
import postsService from '../services/postsService';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await postsService.getUser(userId);
        const [userPosts, shared] = await Promise.all([
          postsService.getPostsByUserId(userId),
          postsService.getSharedPostsByUserId(userId)
        ]);
        setUser(userData);
        setPosts(userPosts);
        setSharedPosts(shared);

      } catch (err) {
        setError(err.message || 'Failed to load profile data');
        toast.error(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const stats = {
    postCount: posts.length,
    sharedCount: sharedPosts.length,
    totalComments: posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Profile Info */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{user?.username}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
            <Typography variant="body2" color="text.secondary">
              Joined {formatDate(user?.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} mt={3}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
              <Typography variant="h6">{stats.postCount}</Typography>
              <Typography variant="body2">Posts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
              <Typography variant="h6">{stats.sharedCount}</Typography>
              <Typography variant="body2">Shares</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
              <Typography variant="h6">{stats.totalComments}</Typography>
              <Typography variant="body2">Comments</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* User's Posts */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Posts ({posts.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {posts.length > 0 ? (
          posts.map((post) => (
            <Box key={post._id} mb={3}>
              <PostCard post={post} showUserInfo={false} />
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No posts yet.</Typography>
        )}
      </Box>

      {/* Shared Posts */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Shared Posts ({sharedPosts.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {sharedPosts.length > 0 ? (
          sharedPosts.map((post) => (
            <Box key={post._id} mb={3} position="relative">
              <Chip
                label={`🔄 Shared by ${post.sharedBy?.username || 'Unknown'}`}
                size="small"
                color="success"
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
              />
              <PostCard post={post} showUserInfo={true} />
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No shared posts yet.</Typography>
        )}
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </Container>
  );
};

export default ProfilePage;
