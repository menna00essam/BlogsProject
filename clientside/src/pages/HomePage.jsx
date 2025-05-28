import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import postsService from '../services/postsService';
import { useAuth } from '../hooks/useAuth';
import { 
  Button, 
  Dialog, 
  CircularProgress, 
  Box, 
  Typography, 
  Fab,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Collapse,
  Container,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function HomePage() {
  // eslint-disable-next-line no-unused-vars
  const { user, token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [posts, setPosts] = useState([]);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (selectedFilter === 'my posts' && user) {
      result = result.filter(post => {
        const postUserId = typeof post.user === 'string' ? post.user : post.user?._id;
        return postUserId === user._id;
      });
    }

    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(post => {
        const titleMatch = post.title?.toLowerCase().includes(query);
        
        const descriptionMatch = post.description?.toLowerCase().includes(query) || 
                                post.content?.toLowerCase().includes(query);
        
        let userMatch = false;
        if (typeof post.user === 'string') {
          userMatch = false;
        } else if (post.user && post.user.username) {
          userMatch = post.user.username.toLowerCase().includes(query);
        }

        const tagsMatch = post.tags && Array.isArray(post.tags) 
          ? post.tags.some(tag => tag.toLowerCase().includes(query))
          : false;

        return titleMatch || descriptionMatch || userMatch || tagsMatch;
      });
    }

    return result;
  }, [posts, selectedFilter, debouncedSearchQuery, user]);

  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const myPosts = user ? posts.filter(post => {
      const postUserId = typeof post.user === 'string' ? post.user : post.user?._id;
      return postUserId === user._id;
    }).length : 0;
    
    return {
      total: totalPosts,
      myPosts,
      filtered: filteredPosts.length
    };
  }, [posts, user, filteredPosts.length]);

  const handleOpenForm = () => setOpenAddForm(true);
  const handleCloseForm = () => setOpenAddForm(false);

  const handleAddSuccess = useCallback(() => {
    toast.success('Post created successfully!');
    fetchPosts();
    handleCloseForm();
  }, []);


  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    if (value && !showSearch) {
      setShowSearch(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setShowSearch(false);
    setSelectedFilter('all');
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch && searchQuery) {
      setSearchQuery('');
    }
  };

  const sidebarItems = [
    { 
      icon: <HomeIcon />, 
      text: 'All Posts', 
      active: selectedFilter === 'all',
      onClick: () => setSelectedFilter('all'),
      count: stats.total
    },
    { 
      icon: <PersonIcon />, 
      text: 'My Posts', 
      active: selectedFilter === 'my posts',
      onClick: () => setSelectedFilter('my posts'),
      disabled: !user,
      count: stats.myPosts
    },
  ];

  const Sidebar = () => (
    <Paper 
      elevation={2}
      sx={{ 
        height: 'fit-content',
        maxHeight: 'calc(100vh - 100px)',
        position: 'sticky',
        top: 20,
        bgcolor: 'background.paper',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <Box sx={{ p: 3 }}>
        {user && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mr: 2,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {user.username || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user.username || 'username'}
                </Typography>
              </Box>
            </Box>
            <Divider />
          </Box>
        )}

        <List sx={{ mb: 3, px: 0 }}>
          {sidebarItems.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={item.onClick}
              disabled={item.disabled}
              sx={{
                borderRadius: 3,
                mb: 1,
                px: 2,
                py: 1.5,
                bgcolor: item.active ? 'primary.main' : 'transparent',
                color: item.active ? 'white' : 'text.primary',
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: item.disabled ? 'transparent' : (item.active ? 'primary.dark' : 'action.hover'),
                  transform: item.disabled ? 'none' : 'translateX(4px)',
                },
                boxShadow: item.active ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: 40,
                '& svg': { fontSize: '1.4rem' }
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.active ? 600 : 500,
                  fontSize: '0.95rem'
                }}
              />
              {item.count !== undefined && (
                <Chip
                  label={item.count}
                  size="small"
                  sx={{
                    bgcolor: item.active ? 'rgba(255,255,255,0.2)' : 'action.selected',
                    color: item.active ? 'white' : 'text.secondary',
                    fontWeight: 'bold',
                    minWidth: 32,
                    height: 24
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mb: 3 }} />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Statistics
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 3,
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2">
                  Total Posts
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 3,
                  bgcolor: 'success.light',
                  color: 'success.dark',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {stats.myPosts}
                </Typography>
                <Typography variant="caption">
                  My Posts
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 3,
                  bgcolor: 'info.light',
                  color: 'info.dark',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {stats.filtered}
                </Typography>
                <Typography variant="caption">
                  Showing
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );

  const MainContent = () => (
    <Box sx={{ flex: 1, minHeight: '100vh' }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mb: 3, 
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
            Welcome Back{user ? `, ${user.username}` : ''}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Share your thoughts and connect with the community
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${stats.total} Posts Available`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            {user && (
              <Chip 
                label={`${stats.myPosts} Your Posts`}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
            {searchQuery && (
              <Chip 
                label={`${stats.filtered} Results`}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['all', 'my posts'].map((filter) => (
                <Chip
                  key={filter}
                  label={filter === 'all' ? 'All Posts' : 'My Posts'}
                  variant={selectedFilter === filter ? 'filled' : 'outlined'}
                  size="medium"
                  clickable
                  onClick={() => setSelectedFilter(filter)}
                  color={selectedFilter === filter ? 'primary' : 'default'}
                  disabled={filter === 'my posts' && !user}
                  sx={{
                    fontWeight: selectedFilter === filter ? 'bold' : 'normal',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(searchQuery || selectedFilter !== 'all') && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearAll}
                startIcon={<ClearIcon />}
                sx={{ borderRadius: 2 }}
              >
                Clear All
              </Button>
            )}
            <IconButton 
              size="large" 
              onClick={toggleSearch}
              sx={{
                bgcolor: showSearch ? 'primary.main' : 'action.hover',
                color: showSearch ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: showSearch ? 'primary.dark' : 'action.selected',
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={showSearch || searchQuery}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Search posts by title, content, author, or tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus={showSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                  }
                }
              }}
            />
            {searchQuery && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                Found {stats.filtered} result{stats.filtered !== 1 ? 's' : ''} for "{searchQuery}"
              </Typography>
            )}
          </Box>
        </Collapse>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading posts...
            </Typography>
          </Box>
        </Box>
      )}

      {!loading && posts.length === 0 && (
        <Paper 
          elevation={2}
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 4,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontSize: '3rem' }}>
            📝
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            No posts yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Be the first to create a post and start the conversation! Share your thoughts with the community.
          </Typography>
          {user && (
            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenForm}
              sx={{ 
                borderRadius: 3,
                py: 1.5,
                px: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Create Your First Post
            </Button>
          )}
        </Paper>
      )}

      {!loading && posts.length > 0 && stats.filtered === 0 && (
        <Paper 
          elevation={2}
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: 4,
            borderRadius: 4,
            border: '2px solid',
            borderColor: 'warning.light',
            bgcolor: 'warning.light'
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontSize: '3rem' }}>
            🔍
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="warning.dark" sx={{ mb: 2 }}>
            No matching posts found
          </Typography>
          <Typography variant="body1" color="warning.dark" sx={{ mb: 3 }}>
            {searchQuery 
              ? `No posts found for "${searchQuery}". Try different keywords.`
              : 'No posts match the current filter. Try changing your selection.'
            }
          </Typography>
          <Button 
            variant="contained" 
            color="warning"
            onClick={handleClearAll}
            sx={{ borderRadius: 3 }}
          >
            Clear Search & Filters
          </Button>
        </Paper>
      )}

      {!loading && filteredPosts.map((post, index) => (
        <Box 
          key={post._id} 
          sx={{ 
            mb: 3,
            opacity: 0,
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
            '@keyframes fadeInUp': {
              from: {
                opacity: 0,
                transform: 'translateY(30px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
        <PostCard post={post} showUserInfo={true} />

        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
      pt: 3,
      pb: 6,
    }}>
      <Container maxWidth="xl">
        <Box sx={{ 
          display: 'flex',
          gap: 3,
          alignItems: 'flex-start'
        }}>
          {!isMobile && (
            <Box sx={{ width: 320, flexShrink: 0 }}>
              <Sidebar />
            </Box>
          )}

          <MainContent />
        </Box>
      </Container>

      {user && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenForm}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
            }
          }}
        >
          <AddIcon sx={{ fontSize: '2rem' }} />
        </Fab>
      )}

      <Dialog
        open={openAddForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4
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