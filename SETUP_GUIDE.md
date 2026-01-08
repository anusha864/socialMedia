# Complete Setup Guide - Instagram-like Social Media App

## 🚀 Quick Start

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/socialmedia
PORT=5000
```

Start backend:
```bash
npm start
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:
```bash
npm start
```

### Step 3: Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ✅ All Features Implemented

### Core Features
- ✅ User Signup/Login
- ✅ Secure Password Hashing
- ✅ User Profiles with Bio & Photo
- ✅ Edit Profile

### Social Features
- ✅ Create Posts (text + images)
- ✅ News Feed
- ✅ Like/Unlike Posts
- ✅ Comments on Posts
- ✅ Follow Requests System
- ✅ Accept/Decline Follow Requests
- ✅ Discover Users
- ✅ Private Messaging/Chat
- ✅ Real-time Message Updates
- ✅ Unread Message Badges
- ✅ Follow Request Notifications

### UI Features
- ✅ Instagram-like Design
- ✅ Responsive (Mobile & Desktop)
- ✅ Navigation Bar
- ✅ Loading States
- ✅ Error Handling

## 📋 Testing Checklist

1. **Authentication**
   - [ ] Sign up new account
   - [ ] Login with credentials
   - [ ] Logout works

2. **Posts**
   - [ ] Create a post
   - [ ] Add image to post
   - [ ] Like a post
   - [ ] Comment on a post
   - [ ] Delete your own post

3. **Following**
   - [ ] Send follow request
   - [ ] View pending requests
   - [ ] Accept follow request
   - [ ] Decline follow request
   - [ ] See posts from followed users in feed

4. **Discover**
   - [ ] Browse discover page
   - [ ] See user cards
   - [ ] Follow users from discover
   - [ ] Message users from discover

5. **Messaging**
   - [ ] View conversations list
   - [ ] Open a chat
   - [ ] Send messages
   - [ ] Receive messages
   - [ ] See unread badges

6. **Profile**
   - [ ] View your profile
   - [ ] View other users' profiles
   - [ ] Edit your bio and photo
   - [ ] See your posts grid
   - [ ] See follower/following counts

## 🔧 Troubleshooting

### Backend not starting?
- Check MongoDB is running
- Verify `.env` file exists
- Check port 5000 is not in use

### Frontend errors?
- Check backend is running on port 5000
- Verify API_URL in frontend
- Check browser console for errors

### Database issues?
- Ensure MongoDB is installed and running
- Check connection string in `.env`
- Verify database name is correct

## 📝 Notes

- All features are fully functional
- Follow system uses requests (not direct follow)
- Messages update automatically every 3 seconds
- Follow requests show notification badge
- All routes are properly configured
- Error handling is implemented throughout


