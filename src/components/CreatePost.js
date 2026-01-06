import React, { useState } from 'react';
import axios from 'axios';
import './CreatePost.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CreatePost({ userId, onPostCreated }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const response = await axios.post(`${API_URL}/posts`, {
        userId,
        content,
        image: image.trim() || undefined
      });

      if (response.data.success) {
        setContent('');
        setImage('');
        if (onPostCreated) {
          // Pass the complete post data
          onPostCreated(response.data.post);
        }
      } else {
        alert(response.data.message || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Create post error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create post. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="create-post-card">
      <h3>Create Post</h3>
      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="post-textarea"
          rows="4"
          maxLength="500"
        />
        <div className="char-count">{content.length}/500</div>
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="post-image-input"
        />
        <button
          type="submit"
          className="post-submit-btn"
          disabled={!content.trim() || isPosting}
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;

