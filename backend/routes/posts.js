const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { userId, content, image } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required'
      });
    }

    const post = new Post({
      user: userId,
      content,
      image: image || ''
    });

    await post.save();
    await post.populate('user', 'username photo');
    await post.populate('likes', 'username');
    await post.populate('comments.user', 'username photo');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all posts (for news feed)
router.get('/feed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get posts from user and users they follow
    const followingIds = [userId.toString(), ...user.following.map(id => id.toString())];
    const posts = await Post.find({ user: { $in: followingIds } })
      .populate('user', 'username photo')
      .populate('likes', 'username')
      .populate('comments.user', 'username photo')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      posts: posts || []
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const posts = await Post.find({ user: userId })
      .populate('user', 'username photo')
      .populate('likes', 'username')
      .populate('comments.user', 'username photo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts: posts || []
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Like/Unlike a post
router.post('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.some(likeId => likeId.toString() === userId.toString());

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      if (!post.likes.some(id => id.toString() === userId.toString())) {
        post.likes.push(userId);
      }
    }

    await post.save();
    await post.populate('user', 'username photo');
    await post.populate('likes', 'username');
    await post.populate('comments.user', 'username photo');

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      post
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add comment to post
router.post('/:postId/comment', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        success: false,
        message: 'User ID and comment text are required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: userId,
      text
    });

    await post.save();
    await post.populate('user', 'username photo');
    await post.populate('likes', 'username');
    await post.populate('comments.user', 'username photo');

    res.json({
      success: true,
      message: 'Comment added',
      post
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete a post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

