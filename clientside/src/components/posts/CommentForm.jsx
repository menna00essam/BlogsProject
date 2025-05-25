import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import postsService from '../../services/postsService';
import { toast } from 'react-toastify';

const CommentForm = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const newComment = await postsService.addComment(postId, {
        content: comment.trim()
      });

      setComment('');

      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2
        }}
      >
        <Avatar
          src={user.avatar}
          alt={user.name}
          sx={{ width: 32, height: 32, mt: 1 }}
        />

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Write a comment..."
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3
              }
            }}
          />

          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={loading || !comment.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
              sx={{ borderRadius: 3 }}
            >
              {loading ? 'Posting...' : 'Comment'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentForm;
