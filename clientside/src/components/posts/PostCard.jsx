import React, { useState, useEffect, memo } from 'react';
import {
  Card, CardHeader, CardMedia, CardContent, CardActions,
  IconButton, Typography, Avatar, Box, Chip, Tooltip, Fade
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

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  if (!post || !post.user) {
    return (
      <Card sx={{ mb: 3, p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
        <Typography color="error" variant="body1">
          Unable to display post: post data is missing.
        </Typography>
      </Card>
    );
  }

  const isAuthor = user && post.user && (
    typeof post.user === 'string'
      ? String(post.user) === String(user._id)
      : String(post.user._id) === String(user._id)
  );

  const isLiked = user && Array.isArray(post.reactions) &&
    post.reactions.some(reaction =>
      (reaction.user === user._id || reaction.user?._id === user._id) &&
      reaction.type === 'like'
    );

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/${imageUrl}`;
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await deletePost(post._id);
        onPostDelete?.(post._id);
      } catch (error) {
        console.error('Failed to delete post:', error);
        toast.error('Failed to delete post. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking || !user) return;
    setIsLiking(true);

    try {
      const updatedPost = {
        ...post,
        reactions: isLiked
          ? post.reactions.filter(r =>
              !((r.user === user._id || r.user?._id === user._id) && r.type === 'like')
            )
          : [...post.reactions, {
              user: user._id,
              type: 'like',
              _id: `temp_${Date.now()}`
            }]
      };
      setPost(updatedPost);
      onPostUpdate?.(updatedPost, true);

      const serverUpdatedPost = await likePost(post._id);
      setPost(serverUpdatedPost);
      onPostUpdate?.(serverUpdatedPost, true);
    } catch (error) {
      console.error('Failed to like post:', error);
      setPost(initialPost);
      onPostUpdate?.(initialPost, true);
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
      console.error('Failed to share post:', error);
      toast.error('Failed to share post. Please try again.');
    }
  };

  const toggleComments = (e) => {
    e.preventDefault();
    setShowComments(!showComments);
  };

  const getAvatarText = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      if (diffInMinutes < 1) return 'just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return 'Unknown date';
    }
  };

  const handleCommentsUpdate = (newCommentsCount) => {
    setPost(prev => ({
      ...prev,
      comments: [...Array(newCommentsCount)]
    }));
  };

  const likesCount = post.reactions?.filter(r => r.type === 'like').length || 0;
  const commentsCount = post.comments?.length || 0;

  return (
    <Fade in timeout={300}>
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', opacity: isDeleting ? 0.5 : 1 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 'bold' }}>
              {typeof post.user === 'string'
                ? post.user.charAt(0).toUpperCase()
                : getAvatarText(post.user.username)}
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {typeof post.user === 'string' ? post.user : post.user.username || 'Unknown User'}
              </Typography>
              {isAuthor && (
                <Chip label="You" size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem', height: 20 }} />
              )}
            </Box>
          }
          subheader={
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {formatDate(post.createdAt)}
            </Typography>
          }
          sx={{ pb: 1 }}
        />

        {post.imageUrl && (
          <CardMedia
            component="img"
            sx={{ height: 350, objectFit: 'cover', backgroundColor: 'grey.100' }}
            image={getImageUrl(post.imageUrl)}
            alt={post.title || 'Post image'}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1.5 }}>
            {post.title || 'Untitled Post'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {post.description || 'No description available.'}
          </Typography>
        </CardContent>

        <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}>
              <IconButton onClick={handleLike} disabled={isDeleting || isLiking || !user} type="button" sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}>
                {isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20, fontWeight: 500 }}>
              {likesCount}
            </Typography>

            <Tooltip title="Comments">
              <IconButton onClick={toggleComments} disabled={isDeleting} type="button" sx={{ color: showComments ? 'primary.main' : 'text.secondary' }}>
                <Comment />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20, fontWeight: 500 }}>
              {commentsCount}
            </Typography>

            <Tooltip title="Share">
              <IconButton onClick={handleShare} disabled={isDeleting} type="button" sx={{ color: 'text.secondary' }}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>

          {isAuthor && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit Post">
                <IconButton component={RouterLink} to={`/posts/edit/${post._id}`} disabled={isDeleting} size="small" type="button">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Post">
                <IconButton onClick={handleDelete} disabled={isDeleting} size="small" type="button">
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </CardActions>

        {showComments && (
          <CommentsSection
            postId={post._id}
            onCommentsUpdate={handleCommentsUpdate}
            existingComments={post.comments}
          />
        )}
      </Card>
    </Fade>
  );
});

export default PostCard;
