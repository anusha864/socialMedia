import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Navbar({ currentUserId }) {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (currentUserId) {
      fetchPendingRequests();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  const fetchPendingRequests = async () => {
    if (!currentUserId) return;
    try {
      const response = await axios.get(`${API_URL}/follow-requests/pending/${currentUserId}`);
      if (response.data.success) {
        setPendingRequests(response.data.requests?.length || 0);
      }
    } catch (err) {
      console.error('Fetch pending requests error:', err);
    }
  };

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Social Media
        </Link>
        {currentUserId && (
          <div className="navbar-links">
            <Link to={`/feed/${currentUserId}`} className="nav-link">
              Feed
            </Link>
            <Link to={`/discover/${currentUserId}`} className="nav-link">
              Discover
            </Link>
            <Link to={`/messages/${currentUserId}`} className="nav-link">
              Messages
            </Link>
            <Link to={`/follow-requests/${currentUserId}`} className="nav-link requests-link">
              Requests
              {pendingRequests > 0 && (
                <span className="notification-badge">{pendingRequests}</span>
              )}
            </Link>
            <Link to={`/profile/${currentUserId}`} className="nav-link">
              Profile
            </Link>
            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

