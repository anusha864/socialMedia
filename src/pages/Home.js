import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Social Media</h1>
        <p className="home-subtitle">Connect with friends and share your moments</p>
        <div className="home-buttons">
          <Link to="/auth" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;


