import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Chat.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Chat() {
  const { userId, otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (otherUserId && userId) {
      fetchMessages();
      fetchOtherUser();
    }
  }, [userId, otherUserId]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!otherUserId || !userId) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/${otherUserId}`);
      if (response.data.success) {
        setOtherUser(response.data.user);
      }
    } catch (err) {
      console.error('Fetch user error:', err);
    }
  };

  const fetchMessages = async () => {
    if (!userId || !otherUserId) return;
    try {
      const response = await axios.get(`${API_URL}/messages/${userId}/${otherUserId}`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const response = await axios.post(`${API_URL}/messages`, {
        senderId: userId,
        receiverId: otherUserId,
        content: messageText
      });

      if (response.data.success) {
        setMessageText('');
        // Immediately add the new message to the list
        if (response.data.data) {
          setMessages([...messages, response.data.data]);
        }
        // Also refresh to get the complete message
        setTimeout(() => fetchMessages(), 500);
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!otherUserId) {
    return (
      <div className="chat-container">
        <Navbar currentUserId={userId} />
        <div className="chat-placeholder">
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Navbar currentUserId={userId} />
      <div className="chat-window">
        {otherUser && (
          <div className="chat-header">
            <div className="chat-user-info">
              <div className="chat-user-avatar">
                {otherUser.photo ? (
                  <img src={otherUser.photo} alt={otherUser.username} />
                ) : (
                  otherUser.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="chat-user-name">{otherUser.username}</div>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => {
              const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
              const isOwn = senderId === userId || senderId?.toString() === userId;
              return (
                <div key={msg._id} className={`message ${isOwn ? 'own' : 'other'}`}>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            maxLength="1000"
          />
          <button type="submit" disabled={!messageText.trim() || sending} className="chat-send-btn">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;

