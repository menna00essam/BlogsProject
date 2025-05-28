/* eslint-disable no-unused-vars */
import React, { useState, useEffect, memo } from 'react';
import {
  Card, CardHeader, CardMedia, CardContent, CardActions,
  IconButton, Typography, Avatar, Box, Chip, Tooltip, Fade,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button
} from '@mui/material';
import {
  FavoriteBorder, Favorite, Share, Comment, Edit, Delete
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import CommentsSection from './CommentsSection';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostCard = memo(({ post: initialPost, onPostUpdate, onPostDelete }) => {
  const { user } = useAuth();
  const { likePost, deletePost, sharePost } = usePosts();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialPost.comments?.length || 0);

  useEffect(() => {
    setPost(initialPost);
    setCommentsCount(initialPost.comments?.length || 0);
  }, [initialPost]);

  if (!post?.user) {
    return (
      <Card sx={{ mb: 3, p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
        <Typography color="error">Unable to display post: post data is missing.</Typography>
      </Card>
    );
  }

  const isAuthor = user && post.user && (
    typeof post.user === 'string' 
      ? post.user === user._id 
      : post.user._id === user._id
  );

  const isLiked = user && post.reactions?.some(r => 
    (r.user === user._id || r.user?._id === user._id) && r.type === 'like'
  );

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${url}`;
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      onPostDelete?.(post._id);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (isLiking || !user) return;
    setIsLiking(true);

    try {
      const updatedPost = await likePost(post._id);
      setPost(updatedPost);
      onPostUpdate?.(updatedPost, true);
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await sharePost(post._id);
      toast.success('Post shared successfully!');
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const handleCommentsToggle = () => {
    setShowComments(!showComments);
  };

  const handleCommentsUpdate = (newCount) => {
    if (typeof newCount === 'function') {
      setCommentsCount(prev => newCount(prev));
    } else {
      setCommentsCount(newCount);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const likesCount = post.reactions?.filter(r => r.type === 'like').length || 0;

  return (
    <>
      <Fade in timeout={300}>
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', opacity: isDeleting ? 0.5 : 1 }}>
          {/* Card Header */}
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {typeof post.user === 'string' 
                  ? post.user.charAt(0).toUpperCase()
                  : post.user.username?.charAt(0).toUpperCase() || '?'}
              </Avatar>
            }
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight="bold">
                  {typeof post.user === 'string' ? post.user : post.user.username || 'Unknown'}
                </Typography>
                {isAuthor && <Chip label="You" size="small" variant="outlined" />}
              </Box>
            }
            subheader={formatDate(post.createdAt)}
          />

          {/* Post Image */}
          {post.imageUrl && (
            <CardMedia
              component="img"
              height="350"
              image={getImageUrl(post.imageUrl)}
              alt={post.title}
              onError={(e) => e.target.style.display = 'none'}
            />
          )}

          {/* Post Content */}
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {post.title || 'Untitled Post'}
            </Typography>
            <Typography variant="body1" color="text.secondary" whiteSpace="pre-wrap">
              {post.description || 'No description available.'}
            </Typography>
          </CardContent>

          {/* Card Actions */}
          <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}>
                <IconButton onClick={handleLike} disabled={!user} sx={{ color: isLiked ? 'error.main' : 'inherit' }}>
                  {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
              <Typography>{likesCount}</Typography>

              <Tooltip title="Comments">
                <IconButton onClick={handleCommentsToggle}>
                  <Comment color={showComments ? 'primary' : 'inherit'} />
                </IconButton>
              </Tooltip>
              <Typography>{commentsCount}</Typography>

              <Tooltip title="Share">
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>

            {isAuthor && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit Post">
                  <IconButton component={RouterLink} to={`/posts/edit/${post._id}`}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Post">
                  <IconButton onClick={() => setDeleteDialogOpen(true)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </CardActions>

          {/* Comments Section */}
          {showComments && (
            <CommentsSection
              postId={post._id}
              onCommentsUpdate={handleCommentsUpdate}
            />
          )}
        </Card>
      </Fade>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={isDeleting}
            startIcon={<Delete />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default PostCard;