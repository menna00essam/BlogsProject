import React, { useState } from 'react';
import {
  Card, CardHeader, CardMedia, CardContent, CardActions,
  IconButton, Typography, Avatar, Box
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

const PostCard = ({ post: initialPost, onPostUpdate, onPostDelete }) => {
  const { user } = useAuth();
  const { likePost, deletePost, sharePost } = usePosts();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  if (!post || !post.user) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Unable to display post: post data is missing.
      </Typography>
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
        
        if (onPostDelete) {
          onPostDelete(post._id);
        }
      } catch (error) {
        console.error('Failed to delete post:', error);
        toast.error('Failed to delete post. Please try again.');
        
        
      } finally {
        setIsDeleting(false);
      }
    }
  };

 const handleLike = async () => {
  if (isLiking || !user) return;
  
  setIsLiking(true);
  
  try {
    const currentlyLiked = isLiked;
    
    setPost(prevPost => {
      let updatedReactions;
      
      if (currentlyLiked) {
        updatedReactions = prevPost.reactions?.filter(
          r => !((r.user === user._id || r.user?._id === user._id) && r.type === 'like')
        ) || [];
      } else {
        updatedReactions = [
          ...(prevPost.reactions || []),
          {
            user: user._id,
            type: 'like',
            _id: `temp_${Date.now()}`
          }
        ];
      }
      
      return {
        ...prevPost,
        reactions: updatedReactions
      };
    });

    const updatedPost = await likePost(post._id);
    
    setPost(updatedPost);
    
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
    
  } catch (error) {
    console.error('Failed to like post:', error);
    setPost(initialPost);
  } finally {
    setIsLiking(false);
  }
};

  const handleShare = async () => {
    try {
      await sharePost(post._id);
      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Failed to share post:', error);
     toast.error('Failed to share post. Please try again.');

      
    }
  };

  const toggleComments = () => setShowComments(!showComments);

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
    setPost(prevPost => ({
      ...prevPost,
      comments: Array.isArray(prevPost.comments) 
        ? [...Array(newCommentsCount)] 
        : [...Array(newCommentsCount)]
    }));
  };

  const likesCount = Array.isArray(post.reactions) 
    ? post.reactions.filter(r => r.type === 'like').length 
    : 0;

  const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

  return (
    <Card sx={{ mb: 3, maxWidth: '100%', opacity: isDeleting ? 0.5 : 1 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {typeof post.user === 'string' 
              ? post.user.charAt(0).toUpperCase() 
              : getAvatarText(post.user.username)}
          </Avatar>
        }
        title={typeof post.user === 'string' ? post.user : (post.user.username || 'Unknown User')}
        subheader={formatDate(post.createdAt)}
      />

      {post.imageUrl && (
        <CardMedia
          component="img"
          sx={{ height: 300, objectFit: 'cover', backgroundColor: 'grey.100' }}
          image={getImageUrl(post.imageUrl)}
          alt={post.title || 'Post image'}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <CardContent>
        <Typography variant="h6" gutterBottom>
          {post.title || 'Untitled Post'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {post.description || 'No description available.'}
        </Typography>
      </CardContent>

      <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={handleLike} 
            aria-label="like" 
            disabled={isDeleting || isLiking || !user}
            color={isLiked ? 'error' : 'default'}
          >
            {isLiked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography variant="body2" component="span" sx={{ mr: 2 }}>
            {likesCount}
          </Typography>

          <IconButton onClick={toggleComments} aria-label="comments" disabled={isDeleting}>
            <Comment />
          </IconButton>
          <Typography variant="body2" component="span" sx={{ mr: 2 }}>
            {commentsCount}
          </Typography>

          <IconButton onClick={handleShare} aria-label="share" disabled={isDeleting}>
            <Share />
          </IconButton>
        </Box>

        {isAuthor && (
          <Box>
            <IconButton
              component={RouterLink}
              to={`/posts/edit/${post._id}`}
              aria-label="edit"
              disabled={isDeleting}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              aria-label="delete"
              color="error"
              disabled={isDeleting}
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </CardActions>

      {showComments && !isDeleting && (
        <Box sx={{ px: 2, pb: 2 }}>
          <CommentsSection 
            postId={post._id} 
            initialCommentsCount={commentsCount}
            onCommentsUpdate={handleCommentsUpdate}
          />
        </Box>
      )}
    </Card>
  );
};

export default PostCard;