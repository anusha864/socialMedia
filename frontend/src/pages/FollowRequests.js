import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './FollowRequests.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FollowRequests() {
  const { userId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/follow-requests/pending/${userId}`);
      if (response.data.success) {
        setRequests(response.data.requests || []);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      const response = await axios.put(`${API_URL}/follow-requests/${requestId}`, {
        action,
        userId
      });

      if (response.data.success) {
        // Remove the request from the list
        setRequests(requests.filter(req => req.id !== requestId));
      }
    } catch (err) {
      console.error('Handle request error:', err);
      alert(err.response?.data?.message || 'Failed to process request');
    }
  };

  return (
    <div className="follow-requests-container">
      <Navbar currentUserId={userId} />
      <div className="follow-requests-content">
        <div className="follow-requests-header">
          <h1 className="follow-requests-title">Follow Requests</h1>
          <p className="follow-requests-subtitle">Accept or decline follow requests</p>
        </div>

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="no-requests">
            <p>No pending follow requests</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-item">
                <Link to={`/profile/${request.requester.id}`} className="request-user-info">
                  <div className="request-avatar">
                    {request.requester.photo ? (
                      <img src={request.requester.photo} alt={request.requester.username} />
                    ) : (
                      request.requester.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="request-details">
                    <div className="request-username">{request.requester.username}</div>
                    {request.requester.bio && (
                      <div className="request-bio">{request.requester.bio}</div>
                    )}
                    <div className="request-stats">
                      {request.requester.postsCount || 0} posts • {request.requester.followersCount || 0} followers
                    </div>
                  </div>
                </Link>
                <div className="request-actions">
                  <button
                    onClick={() => handleRequest(request.id, 'accept')}
                    className="btn-accept"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(request.id, 'reject')}
                    className="btn-reject"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowRequests;

