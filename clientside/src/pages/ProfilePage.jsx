/* eslint-disable no-unused-vars */
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
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PostCard from '../components/posts/PostCard';
import postsService from '../services/postsService';

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
        const errorMessage = err.message || 'Failed to load profile data';
        setError(errorMessage);
        toast.error(errorMessage);
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
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'error.light',
            bgcolor: 'error.light'
          }}
        >
          {error}
        </Alert>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}
    >
      <Container maxWidth="xl"
      >

        {/* Profile Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: '50% 0 0 50%'
            }
          }}
        >
          <Box position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                  color: 'primary.main'
                }}
              >
                {user?.username?.[0]?.toUpperCase() || '?'}
              </Avatar>

              <Box>
                <Typography variant="h3" fontWeight="bold">{user?.username}</Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>{user?.email}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Joined {formatDate(user?.createdAt)}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} mt={4}>
              {[
                { value: stats.postCount, label: 'Posts', color: 'primary' },
                { value: stats.sharedCount, label: 'Shares', color: 'success' },
                { value: stats.totalComments, label: 'Comments', color: 'info' }
              ].map((stat, index) => (
                <Grid item xs={12} sm={12} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: `${stat.color}.light`,
                      color: `${stat.color}.dark`,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Typography variant="h2" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="h6">{stat.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        {/* Posts and Shared Posts Section */}

          {/* Posts */}
          <Grid item xs={12} md={12}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <TrendingIcon color="primary" />
                <Typography variant="h4" fontWeight="bold">User Posts</Typography>
                <Chip
                  label={`${posts.length} posts`}
                  color="primary"
                  sx={{ ml: 2, fontWeight: 'bold' }}
                />
              </Box>

              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <Box
                    key={post._id}
                    mb={3}
                    sx={{
                      opacity: 0,
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                      '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(30px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <PostCard post={post} showUserInfo={false} />
                  </Box>
                ))
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="h6" color="text.secondary">
                    No posts created yet
                  </Typography>
                </Paper>
              )}
            </Paper>

          {/* Shared Posts */}
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                position: 'sticky',
                top: 20
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Typography variant="h4" fontWeight="bold">Shared Posts</Typography>
                <Chip
                  label={`${sharedPosts.length} shares`}
                  color="secondary"
                  sx={{ ml: 2, fontWeight: 'bold' }}
                />
              </Box>

              {sharedPosts.length > 0 ? (
                sharedPosts.map((post, index) => (
                  <Box
                    key={post._id}
                    mb={2}
                    sx={{
                      opacity: 0,
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                      '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(30px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <Box position="relative">
                      <Chip
                        label={`Shared by ${post.sharedBy?.username || 'Unknown'}`}
                        size="small"
                        color="success"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 10,
                          fontWeight: 'bold',
                          boxShadow: 1
                        }}
                      />
                      <PostCard post={post} showUserInfo={true} />
                    </Box>
                  </Box>
                ))
              ) : (
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="body2" color="text.secondary">
                    No shared posts yet
                  </Typography>
                </Paper>
              )}
            </Paper>
        </Grid>
      </Container>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </Box>
  );
};

export default ProfilePage;
