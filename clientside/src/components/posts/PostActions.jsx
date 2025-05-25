import { Button, IconButton, Typography } from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Share } from '@mui/icons-material';

const PostsAction = ({
  post,
  user,
  showComments,
  onLike,
  onShare,
  onToggleComments,
  likesCount,
  commentsCount,
  isLiking = false,
  disabled = false,
}) => {
  const userId = user?._id || user?.id;

  const isLiked = post.reactions?.some(reaction =>
    (reaction.user?._id || reaction.user) === userId && reaction.type === 'like'
  );

  const handleLikeClick = async () => {
    if (!user || isLiking) return;
    try {
      await onLike(post._id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <>
      <IconButton
        aria-label="like"
        onClick={handleLikeClick}
        color={isLiked ? 'primary' : 'default'}
        disabled={disabled || !user}
      >
        {isLiked ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
      <Typography variant="body2" sx={{ mr: 2 }}>
        {likesCount}
      </Typography>

      <IconButton
        aria-label="comment"
        onClick={onToggleComments}
        disabled={disabled || !user}
      >
        <Comment />
      </IconButton>
      <Typography variant="body2" sx={{ mr: 2 }}>
        {commentsCount}
      </Typography>

      {user && (
        <IconButton aria-label="share" onClick={() => onShare(post._id)} disabled={disabled}>
          <Share />
        </IconButton>
      )}

      <Button size="small" onClick={onToggleComments} sx={{ ml: 'auto' }}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </Button>
    </>
  );
};

export default PostsAction;
