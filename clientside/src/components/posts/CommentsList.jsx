import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import postsService from '../../services/postsService';

const CommentsList = ({ comments = [], onCommentDeleted }) => {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;

    setLoading(true);
    try {
      await postsService.deleteComment(commentToDelete._id);
      
      if (onCommentDeleted) {
        onCommentDeleted(commentToDelete._id);
      }
      
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
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

  if (!comments || comments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <List sx={{ width: '100%', pt: 0 }}>
        {comments.map((comment, index) => (
          <React.Fragment key={comment._id || index}>
            <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
              <ListItemAvatar>
                <Avatar
                  src={comment.author?.avatar}
                  alt={comment.author?.name || comment.author?.username}
                  sx={{ width: 32, height: 32 }}
                >
                  {(comment.author?.name || comment.author?.username || 'A').charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        component="span"
                        fontWeight="bold"
                        sx={{ mr: 1 }}
                      >
                        {comment.author?.name || comment.author?.username || 'Anonymous'}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        color="text.secondary"
                      >
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                    
                    {user && comment.author?._id === user._id && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(comment)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ mt: 0.5, lineHeight: 1.4 }}
                  >
                    {comment.content}
                  </Typography>
                }
              />
            </ListItem>

            {index < comments.length - 1 && (
              <Divider variant="inset" component="li" sx={{ ml: 5 }} />
            )}
          </React.Fragment>
        ))}
      </List>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={loading}
            variant="contained"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommentsList;
