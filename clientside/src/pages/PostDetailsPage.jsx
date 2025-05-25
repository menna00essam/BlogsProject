import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/posts/PostCard';
import CommentForm from '../components/posts/CommentForm';
import postsService from '../services/postsService';

export default function PostDetailsPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    postsService.getAllPosts()
      .then(posts => {
        const foundPost = posts.find(p => p._id === id);
        if (foundPost) {
          setPost(foundPost);
          setComments(foundPost.comments || []);  
        }
      })
      .catch(console.error);
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <PostCard post={post} />

      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first!</p>
      ) : (
        <ul>
          {comments.map(comment => (
            <li key={comment._id}>
              <strong>{comment.author}</strong>: {comment.text}
            </li>
          ))}
        </ul>
      )}

      <CommentForm
        postId={id}
        onNewComment={comment => setComments(prev => [...prev, comment])}
      />
    </div>
  );
}
