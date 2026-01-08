import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingAction, setIsFollowingAction] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Get current user ID from localStorage or URL
  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || id;
  };
  
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());
  
  // Update currentUserId when localStorage changes
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchPosts();
      const userId = getCurrentUserId();
      if (userId && userId !== id) {
        checkFollowStatus();
      }
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/${id}`);
      
      if (response.data.success) {
        setUser(response.data.user);
        setBioText(response.data.user.bio || '');
        setPhotoUrl(response.data.user.photo || '');
      } else {
        setError('Failed to load user data');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to load profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/user/${id}`);
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      console.error('Fetch posts error:', err);
    }
  };

  const checkFollowStatus = async () => {
    const userId = getCurrentUserId();
    if (!userId || userId === id) return;
    try {
      const response = await axios.get(`${API_URL}/users/${id}/follow-status/${userId}`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (err) {
      console.error('Check follow status error:', err);
    }
  };

  const handleFollow = async () => {
    if (isFollowingAction) return;
    const userId = getCurrentUserId();
    if (!userId) {
      alert('Please log in to follow users');
      navigate('/auth');
      return;
    }
    setIsFollowingAction(true);
    try {
      // Send follow request instead of direct follow
      const response = await axios.post(`${API_URL}/follow-requests`, {
        requesterId: userId,
        recipientId: id
      });
      if (response.data.success) {
        alert('Follow request sent! The user will be notified.');
        // Don't update follow status yet - wait for acceptance
      } else {
        alert(response.data.message || 'Failed to send follow request');
      }
    } catch (err) {
      console.error('Follow request error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to send follow request. Please check your connection.';
      alert(errorMessage);
    } finally {
      setIsFollowingAction(false);
    }
  };

  const handleSaveProfile = async () => {
    const userId = getCurrentUserId();
    if (userId !== id) {
      alert('You can only edit your own profile');
      return;
    }
    setIsSaving(true);
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, {
        bio: bioText.trim(),
        photo: photoUrl.trim()
      });
      if (response.data.success) {
        setUser(response.data.user);
        setEditingBio(false);
        // Refresh user data
        await fetchUser();
      } else {
        alert(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar currentUserId={currentUserId} />
        <div className="profile-container">
          <div className="profile-card">
            <div className="loading">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <Navbar currentUserId={currentUserId} />
        <div className="profile-container">
          <div className="profile-card">
            <div className="error-message">{error || 'User not found'}</div>
            <Link to="/" className="btn-home">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = getCurrentUserId() === id;

  return (
    <div className="profile-page">
      <Navbar currentUserId={currentUserId} />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {user.photo ? (
                <img src={user.photo} alt={user.username} />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-username">{user.username}</h1>
              
              {editingBio ? (
                <div className="edit-bio-section">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Write a bio..."
                    maxLength="150"
                    className="bio-textarea"
                  />
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Photo URL (optional)"
                    className="photo-input"
                  />
                  <div className="edit-bio-actions">
                    <button onClick={handleSaveProfile} disabled={isSaving} className="btn-save">
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingBio(false)} className="btn-cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-bio-section">
                  {user.bio && <p className="profile-bio">{user.bio}</p>}
                  {!user.bio && isOwnProfile && (
                    <p className="profile-bio-placeholder">No bio yet. Click Edit Profile to add one.</p>
                  )}
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.followersCount || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.followingCount || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>

              <div className="profile-actions">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setEditingBio(true)} className="btn btn-primary">
                      Edit Profile
                    </button>
                    <Link to={`/feed/${id}`} className="btn btn-secondary">
                      View Feed
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={isFollowingAction}
                      className={`btn ${isFollowing ? 'btn-unfollow' : 'btn-follow'}`}
                    >
                      {isFollowingAction ? 'Sending...' : (isFollowing ? 'Unfollow' : 'Follow')}
                    </button>
                    <Link 
                      to={`/chat/${getCurrentUserId()}/${id}`} 
                      className="btn btn-secondary"
                    >
                      Message
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="profile-posts-section">
            <h2 className="posts-section-title">Posts</h2>
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>No posts yet.</p>
                {isOwnProfile && (
                  <Link to={`/feed/${id}`} className="btn btn-primary">
                    Create Your First Post
                  </Link>
                )}
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                  <Post
                    key={post._id}
                    post={post}
                    currentUserId={currentUserId}
                    onUpdate={handlePostUpdate}
                    onDelete={handlePostDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
