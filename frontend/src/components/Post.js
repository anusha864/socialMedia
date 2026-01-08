import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Post.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Post({ post, currentUserId, onDelete, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isLiked = post.likes && post.likes.some(like => {
    const likeId = typeof like === 'object' ? (like._id || like) : like;
    return likeId?.toString() === currentUserId?.toString();
  });
  const userId = post.user ? (typeof post.user === 'object' ? (post.user._id || post.user) : post.user) : null;
  const isOwner = userId && (userId.toString() === currentUserId?.toString());

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await axios.post(`${API_URL}/posts/${post._id}/like`, {
        userId: currentUserId
      });
      if (response.data.success && onUpdate) {
        onUpdate(response.data.post);
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const response = await axios.post(`${API_URL}/posts/${post._id}/comment`, {
        userId: currentUserId,
        text: commentText
      });
      if (response.data.success) {
        setCommentText('');
        if (onUpdate) {
          onUpdate(response.data.post);
        }
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await axios.delete(`${API_URL}/posts/${post._id}`, {
        data: { userId: currentUserId }
      });
      if (response.data.success && onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    }
  };

  const getUsername = (user) => {
    if (typeof user === 'object' && user.username) return user.username;
    if (typeof user === 'string') return user;
    return 'Unknown';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now - postDate) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
  };

  const getUserProfileId = () => {
    if (!post.user) return '#';
    if (typeof post.user === 'object') {
      return post.user._id || post.user.id || '#';
    }
    return post.user;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          <Link to={`/profile/${getUserProfileId()}`} className="post-user-link">
            <div className="post-avatar-small">
              {post.user && typeof post.user === 'object' && post.user.photo ? (
                <img src={post.user.photo} alt={getUsername(post.user)} />
              ) : (
                getUsername(post.user).charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="post-username">{getUsername(post.user)}</div>
              <div className="post-time">{getTimeAgo(post.createdAt)}</div>
            </div>
          </Link>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="delete-post-btn" title="Delete post">
            ⋯
          </button>
        )}
      </div>

      {post.image && (
        <img src={post.image} alt="Post" className="post-image" />
      )}

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          disabled={isLiking}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="comment-btn"
          title="Comment"
        >
          💬
        </button>
      </div>

      {post.likes && post.likes.length > 0 && (
        <div className="post-likes-count">
          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
        </div>
      )}

      <div className="post-content">
        <p>
          <strong>{getUsername(post.user)}</strong> {post.content}
        </p>
      </div>

      {post.comments && post.comments.length > 0 && !showComments && (
        <div style={{ padding: '0 16px', marginBottom: '8px' }}>
          <button
            onClick={() => setShowComments(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8e8e8e',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            View all {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      )}

      {showComments && (
        <div className="post-comments">
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, idx) => (
                <div key={idx} className="comment-item">
                  <div className="comment-avatar-small">
                    {comment.user && typeof comment.user === 'object' && comment.user.photo ? (
                      <img src={comment.user.photo} alt={getUsername(comment.user)} />
                    ) : (
                      getUsername(comment.user).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="comment-content">
                    <span className="comment-username">{getUsername(comment.user)}</span>
                    <span className="comment-text"> {comment.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet</div>
            )}
          </div>
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button type="submit" disabled={!commentText.trim() || isCommenting}>
              {isCommenting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Post;
