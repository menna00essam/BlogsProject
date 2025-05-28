import React, { useState, useRef } from 'react';
import {
  Box, TextField, Button, Card, CardContent, CardActions, Typography, Avatar,
  IconButton, CircularProgress, Alert, Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { validatePost } from '../../utils/validators';

const PostForm = ({ post = null, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { createPost, updatePost } = usePosts();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    image: null
  });

  const [preview, setPreview] = useState(post?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);

  const isEditing = Boolean(post);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setImageRemoved(false);
      setError('');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validatePost(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }
    setLoading(true);
    setError('');

    try {
      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        ...(formData.image && { image: formData.image }),
        ...(isEditing && imageRemoved && { image: null })
      };

      if (isEditing) {
        await updatePost(post._id, postData);
      } else {
        await createPost(postData);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '90vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardContent
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              paddingRight: 3, 
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Avatar
                src={user?.avatar}
                alt={user?.username || user?.name}
                sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
              >
                {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                  {isEditing ? 'Edit Post' : 'Create New Post'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share something interesting with the community
                </Typography>
              </Box>
              {onClose && (
                <IconButton onClick={onClose} size="large" color="error" aria-label="close">
                  <CloseIcon />
                </IconButton>
              )}
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Post Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="Enter an engaging title..."
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
              placeholder="Tell us more about your post..."
              disabled={loading}
              inputProps={{ maxLength: 500 }}
            />

            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Add Image (optional)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Upload Image
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageSelect}
                />
              </Button>

              {(preview || (isEditing && post?.imageUrl && !imageRemoved)) && (
                <Box
                  sx={{
                    position: 'relative',
                    mt: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 1,
                    height: 200,
                    maxWidth: '100%',
                    backgroundColor: 'grey.100'
                  }}
                >
                  <img
                    src={preview || post.imageUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load');
                      e.target.style.display = 'none';
                    }}
                  />
                  <IconButton
                    onClick={removeImage}
                    disabled={loading}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                      zIndex: 1
                    }}
                    aria-label="remove image"
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </CardContent>

          <CardActions
            sx={{
              px: 3,
              pb: 3,
              pt: 2,
              justifyContent: 'flex-end',
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              flexShrink: 0,
            }}
          >
            {onClose && (
              <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Post' : 'Create Post')}
            </Button>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
};

export default PostForm;
