import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import './NewsFeed.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function NewsFeed() {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const fetchPosts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/posts/feed/${userId}`);
      if (response.data.success) {
        setPosts(response.data.posts || []);
      } else {
        setError('Failed to load feed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feed. Please try again.');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = async (newPost) => {
    if (newPost) {
      // Add the new post to the top of the list
      setPosts([newPost, ...posts]);
    }
    // Also refresh to ensure we have the latest data
    setTimeout(() => fetchPosts(), 1000);
    setError(''); // Clear any previous errors
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    <div className="newsfeed-container">
      <Navbar currentUserId={userId} />
      <div className="newsfeed-content">
        <div className="newsfeed-main">
          <CreatePost userId={userId} onPostCreated={handlePostCreated} />
          
          {loading ? (
            <div className="loading">Loading feed...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Follow some users or create your first post!</p>
            </div>
          ) : (
            posts.map(post => (
              <Post
                key={post._id}
                post={post}
                currentUserId={userId}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NewsFeed;

