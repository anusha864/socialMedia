import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import NewsFeed from './pages/NewsFeed';
import Discover from './pages/Discover';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import FollowRequests from './pages/FollowRequests';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/feed/:userId" element={<NewsFeed />} />
          <Route path="/discover/:userId" element={<Discover />} />
          <Route path="/messages/:userId" element={<ChatList />} />
          <Route path="/chat/:userId/:otherUserId" element={<Chat />} />
          <Route path="/follow-requests/:userId" element={<FollowRequests />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

