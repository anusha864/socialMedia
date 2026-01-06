import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './ChatList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ChatList() {
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversations/${userId}`);
      if (response.data.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-list-container">
      <Navbar currentUserId={userId} />
      <div className="chat-list-content">
        <div className="chat-list-header">
          <h1 className="chat-list-title">Messages</h1>
        </div>

        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet. Start chatting with users!</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => (
              <Link
                key={conv.user.id}
                to={`/chat/${userId}/${conv.user.id}`}
                className="conversation-item"
              >
                <div className="conversation-avatar">
                  {conv.user.photo ? (
                    <img src={conv.user.photo} alt={conv.user.username} />
                  ) : (
                    conv.user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <div className="conversation-username">{conv.user.username}</div>
                    {conv.lastMessage && (
                      <div className="conversation-time">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <div className="conversation-preview">
                      {conv.lastMessage.sender === 'you' ? 'You: ' : ''}
                      {conv.lastMessage.content.length > 50 
                        ? conv.lastMessage.content.substring(0, 50) + '...' 
                        : conv.lastMessage.content}
                    </div>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="unread-badge">{conv.unreadCount}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;

