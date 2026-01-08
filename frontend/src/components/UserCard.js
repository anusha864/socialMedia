import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UserCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function UserCard({ user, currentUserId, onFollowUpdate }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingAction, setIsFollowingAction] = useState(false);

  useEffect(() => {
    if (currentUserId && currentUserId !== user.id) {
      checkFollowStatus();
    }
  }, [currentUserId, user.id]);

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/${user.id}/follow-status/${currentUserId}`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (err) {
      console.error('Check follow status error:', err);
    }
  };

  const handleFollow = async () => {
    if (isFollowingAction || !currentUserId) return;
    setIsFollowingAction(true);
    try {
      // Send follow request instead of direct follow
      const response = await axios.post(`${API_URL}/follow-requests`, {
        requesterId: currentUserId,
        recipientId: user.id
      });
      if (response.data.success) {
        alert('Follow request sent! The user will be notified.');
        // Optionally update UI to show "Requested" status
        if (onFollowUpdate) {
          onFollowUpdate(user.id, false);
        }
      }
    } catch (err) {
      console.error('Follow request error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send follow request';
      alert(errorMsg);
    } finally {
      setIsFollowingAction(false);
    }
  };

  return (
    <div className="user-card">
      <Link to={`/profile/${user.id}`} className="user-card-link">
        <div className="user-card-avatar">
          {user.photo ? (
            <img src={user.photo} alt={user.username} />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="user-card-info">
          <div className="user-card-username">{user.username}</div>
          {user.bio && (
            <div className="user-card-bio">{user.bio}</div>
          )}
          <div className="user-card-stats">
            <span>{user.postsCount || 0} posts</span>
            <span>•</span>
            <span>{user.followersCount || 0} followers</span>
          </div>
        </div>
      </Link>
      <div className="user-card-actions">
        <Link
          to={`/chat/${currentUserId}/${user.id}`}
          onClick={(e) => e.stopPropagation()}
          className="user-card-message-btn"
        >
          Message
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFollow();
          }}
          className={`user-card-follow-btn ${isFollowing ? 'following' : ''}`}
          disabled={isFollowingAction}
        >
          {isFollowingAction ? 'Sending...' : (isFollowing ? 'Following' : 'Follow')}
        </button>
      </div>
    </div>
  );
}

export default UserCard;

