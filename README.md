# Social Media Web Application

A full-stack social media web application built with React, Node.js, Express, and MongoDB.

## Features

### Authentication & User Management
- ✅ User Registration (Signup)
- ✅ User Authentication (Login)
- ✅ Secure Password Hashing (bcrypt)
- ✅ User Profile Pages with Bio & Photo
- ✅ Edit Profile Functionality

### Social Features
- ✅ **Create Posts** - Users can create text posts with optional images
- ✅ **News Feed** - View posts from yourself and users you follow
- ✅ **Like Posts** - Like and unlike posts
- ✅ **Comments** - Add comments to posts
- ✅ **Follow Requests** - Send follow requests (requires approval)
- ✅ **Follow/Unfollow** - Accept/decline follow requests, manage following
- ✅ **User Posts** - View all posts by a specific user on their profile
- ✅ **Discover Page** - Browse and discover new users to follow with their profile info and stats
- ✅ **Private Messaging** - Real-time chat between users
- ✅ **Message Notifications** - Unread message badges
- ✅ **Follow Request Notifications** - Badge showing pending requests

### UI/UX
- ✅ Responsive Design (Mobile & Desktop)
- ✅ Navigation Bar with quick access
- ✅ Real-time updates
- ✅ Loading states and error handling
- ✅ Modern, Instagram-like interface

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- bcryptjs
- CORS

## Project Structure

```
finaleee/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── posts.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Post.js
│   │   │   └── CreatePost.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Auth.js
│   │   │   ├── Profile.js
│   │   │   └── NewsFeed.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/socialmedia
PORT=5000
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialmedia
```

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
  - Body: `{ username, email, password }`
  - Returns: `{ success, message, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ username, password }` (username can be email or username)
  - Returns: `{ success, message, user }`

### Users

- `GET /api/users/:id` - Get user by ID
  - Returns: `{ success, user }`

- `PUT /api/users/:id` - Update user profile
  - Body: `{ bio, photo }`
  - Returns: `{ success, message, user }`

- `POST /api/users/:id/follow` - Follow/Unfollow user
  - Body: `{ followerId }`
  - Returns: `{ success, message, user, isFollowing }`

- `GET /api/users/:id/follow-status/:followerId` - Check follow status
  - Returns: `{ success, isFollowing }`

- `GET /api/users/discover/:userId` - Get suggested users to follow
  - Returns: `{ success, users }` (users not already followed)

### Posts

- `POST /api/posts` - Create a new post
  - Body: `{ userId, content, image }`
  - Returns: `{ success, message, post }`

- `GET /api/posts/feed/:userId` - Get news feed (posts from user and following)
  - Returns: `{ success, posts }`

- `GET /api/posts/user/:userId` - Get all posts by a user
  - Returns: `{ success, posts }`

- `POST /api/posts/:postId/like` - Like/Unlike a post
  - Body: `{ userId }`
  - Returns: `{ success, message, post }`

- `POST /api/posts/:postId/comment` - Add comment to post
  - Body: `{ userId, text }`
  - Returns: `{ success, message, post }`

- `DELETE /api/posts/:postId` - Delete a post
  - Body: `{ userId }`
  - Returns: `{ success, message }`

## Usage

1. Start MongoDB (if using local installation)
2. Start the backend server
3. Start the frontend server
4. Open `http://localhost:3000` in your browser
5. Click "Get Started" to navigate to the auth page
6. Sign up for a new account or login with existing credentials
7. After successful login, you'll be redirected to your **News Feed**
8. Create posts, follow users, like and comment on posts!

## Routes

- `/` - Home page
- `/auth` - Signup/Login page
- `/feed/:userId` - News Feed (posts from you and users you follow)
- `/discover/:userId` - Discover page (browse and follow new users)
- `/messages/:userId` - Messages list (all conversations)
- `/chat/:userId/:otherUserId` - Chat page (direct messaging)
- `/follow-requests/:userId` - Follow requests page (accept/decline requests)
- `/profile/:id` - User profile page (with posts, follow button, bio)

## How to Use

### Creating Posts
1. Go to your News Feed (`/feed/:userId`)
2. Type your post content in the "Create Post" section
3. Optionally add an image URL
4. Click "Post" to share

### Following Users
1. Visit any user's profile page
2. Click the "Follow" button
3. Their posts will now appear in your News Feed

### Liking & Commenting
1. On any post, click the heart icon to like
2. Click the comment icon to view/add comments
3. Type your comment and click "Post"

### Editing Profile
1. Go to your own profile page
2. Click "Edit Profile"
3. Add a bio and/or photo URL
4. Click "Save"

### Discovering Users
1. Click "Discover" in the navigation bar
2. Browse the list of suggested users
3. See their profile picture, bio, and stats (posts, followers)
4. Click "Follow" to send a follow request
5. Click "Message" to start chatting with a user
6. Click on a user's card to view their full profile

### Messaging
1. Click "Messages" in the navigation bar
2. View all your conversations
3. Click on any conversation to open the chat
4. Or click "Message" on any user's profile
5. Type and send messages in real-time
6. Unread messages are marked with a badge

### Follow Requests
1. When someone wants to follow you, they send a request
2. Click "Requests" in the navigation bar (badge shows pending count)
3. View all pending follow requests
4. Click "Accept" to allow them to follow you
5. Click "Decline" to reject the request
6. Once accepted, you'll follow each other

## Future Enhancements

- ✨ JWT authentication for secure sessions
- ✨ Image upload (instead of URL)
- ✨ Real-time notifications
- ✨ Direct messaging
- ✨ Post sharing
- ✨ Hashtags and mentions
- ✨ Search functionality
- ✨ Stories feature

## License

ISC

