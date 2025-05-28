/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
  Box,
  Collapse,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Comment as CommentIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';
import postsService from '../../services/postsService';

const CommentsSection = ({ postId, onCommentsUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true); 
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError('');
    }
  }, [error]);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    if (commentsLoaded) return;

    setLoading(true);
    setError('');

    try {
      const commentsData = await postsService.getCommentsByPost(postId);
      setComments(commentsData || []);
      setCommentsLoaded(true);
      
      if (onCommentsUpdate) {
        onCommentsUpdate(commentsData?.length || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComments = async () => {
    if (!expanded && !commentsLoaded) {
      await loadComments();
    }
    setExpanded(!expanded);
  };

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);

    if (onCommentsUpdate) {
      onCommentsUpdate(prev => (prev || 0) + 1);
    }

    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => {
      const newComments = prevComments.filter(comment => comment._id !== commentId);

      toast.success('Comment deleted successfully!');

      if (onCommentsUpdate) {
        onCommentsUpdate(newComments.length);
      }

      return newComments;
    });
  };

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Button
          onClick={handleToggleComments}
          startIcon={<CommentIcon />}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          {expanded ? 'Hide Comments' : 'Show Comments'} ({comments.length})
        </Button>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <CommentsList
            comments={comments}
            onCommentDeleted={handleCommentDeleted}
          />
        )}
      </Collapse>
    </Box>
  );
};

export default CommentsSection;