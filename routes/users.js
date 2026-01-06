const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

// Get suggested users to follow (users not already followed)
// IMPORTANT: This route must come BEFORE /:id route to avoid route conflicts
router.get('/discover/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all users except current user and users already followed
    const followingIds = [
      userId.toString(), 
      ...currentUser.following.map(id => id.toString())
    ];
    
    const suggestedUsers = await User.find({
      _id: { $nin: followingIds }
    })
      .select('username email photo bio followers following createdAt')
      .limit(20)
      .sort({ createdAt: -1 });

    // Get post counts for each user
    const usersWithInfo = await Promise.all(
      suggestedUsers.map(async (user) => {
        const postsCount = await Post.countDocuments({ user: user._id });
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          photo: user.photo,
          bio: user.bio,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          postsCount: postsCount,
          createdAt: user.createdAt
        };
      })
    );

    res.json({
      success: true,
      users: usersWithInfo || []
    });
  } catch (error) {
    console.error('Get discover users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username photo')
      .populate('following', 'username photo');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        photo: user.photo,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { bio, photo } = req.body;
    
    // Build update object only with provided fields
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio || '';
    if (photo !== undefined) updateData.photo = photo || '';
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Populate followers and following for response
    await user.populate('followers', 'username photo');
    await user.populate('following', 'username photo');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        photo: user.photo,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Follow/Unfollow user (direct follow - for backwards compatibility)
// Note: New follow requests should use /api/follow-requests endpoint
router.post('/:id/follow', async (req, res) => {
  try {
    const { followerId } = req.body;
    const userId = req.params.id;

    if (!followerId) {
      return res.status(400).json({
        success: false,
        message: 'Follower ID is required'
      });
    }

    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const user = await User.findById(userId);
    const follower = await User.findById(followerId);

    if (!user || !follower) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following (convert to string for comparison)
    const isFollowing = user.followers.some(follower => follower.toString() === followerId.toString());

    if (isFollowing) {
      // Unfollow
      user.followers = user.followers.filter(id => id.toString() !== followerId.toString());
      follower.following = follower.following.filter(id => id.toString() !== userId.toString());
    } else {
      // Follow - check if not already in array to avoid duplicates
      if (!user.followers.some(f => f.toString() === followerId.toString())) {
        user.followers.push(followerId);
      }
      if (!follower.following.some(f => f.toString() === userId.toString())) {
        follower.following.push(userId);
      }
    }

    await user.save();
    await follower.save();

    await user.populate('followers', 'username photo');
    await user.populate('following', 'username photo');

    res.json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      user: {
        id: user._id,
        username: user.username,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length
      },
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Check if user is following another user
router.get('/:id/follow-status/:followerId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = user.followers.some(follower => follower.toString() === req.params.followerId.toString());

    res.json({
      success: true,
      isFollowing
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

