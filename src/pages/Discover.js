import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UserCard from '../components/UserCard';
import './Discover.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Discover() {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  const fetchUsers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/users/discover/${userId}`);
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpdate = (userId, isFollowing) => {
    // Remove user from list if they're now being followed
    // Or update the follow status
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isFollowing } : user
    ));
  };

  return (
    <div className="discover-container">
      <Navbar currentUserId={userId} />
      <div className="discover-content">
        <div className="discover-header">
          <h1 className="discover-title">Discover People</h1>
          <p className="discover-subtitle">Find and follow users to see their posts in your feed</p>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : users.length === 0 ? (
          <div className="no-users">
            <p>No more users to discover. You're following everyone!</p>
          </div>
        ) : (
          <div className="users-list">
            {users.map(user => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={userId}
                onFollowUpdate={handleFollowUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Discover;

