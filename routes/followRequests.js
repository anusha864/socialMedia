const express = require('express');
const router = express.Router();
const FollowRequest = require('../models/FollowRequest');
const User = require('../models/User');

// Send follow request
router.post('/', async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

    if (!requesterId || !recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Requester ID and recipient ID are required'
      });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a follow request to yourself'
      });
    }

    // Check if already following
    const recipient = await User.findById(recipientId);
    if (recipient.followers.some(f => f.toString() === requesterId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Check if request already exists
    const existingRequest = await FollowRequest.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Follow request already sent'
      });
    }

    const followRequest = new FollowRequest({
      requester: requesterId,
      recipient: recipientId
    });

    await followRequest.save();
    await followRequest.populate('requester', 'username photo');
    await followRequest.populate('recipient', 'username photo');

    res.status(201).json({
      success: true,
      message: 'Follow request sent',
      request: followRequest
    });
  } catch (error) {
    console.error('Send follow request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get pending follow requests for a user
router.get('/pending/:userId', async (req, res) => {
  try {
    const requests = await FollowRequest.find({
      recipient: req.params.userId,
      status: 'pending'
    })
      .populate('requester', 'username photo bio followers following')
      .sort({ createdAt: -1 });

    const Post = require('../models/Post');
    const requestsWithInfo = await Promise.all(
      requests.map(async (request) => {
        const requester = request.requester;
        const postsCount = await Post.countDocuments({ user: requester._id });

        return {
          id: request._id,
          requester: {
            id: requester._id,
            username: requester.username,
            photo: requester.photo,
            bio: requester.bio,
            followersCount: requester.followers.length,
            followingCount: requester.following.length,
            postsCount: postsCount
          },
          createdAt: request.createdAt
        };
      })
    );

    res.json({
      success: true,
      requests: requestsWithInfo
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Accept or reject follow request
router.put('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, userId } = req.body; // action: 'accept' or 'reject'

    if (!action || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Action and user ID are required'
      });
    }

    const followRequest = await FollowRequest.findById(requestId)
      .populate('requester')
      .populate('recipient');

    if (!followRequest) {
      return res.status(404).json({
        success: false,
        message: 'Follow request not found'
      });
    }

    // Verify the user is the recipient
    if (followRequest.recipient._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to your own follow requests'
      });
    }

    if (action === 'accept') {
      // Add to followers/following
      const requester = await User.findById(followRequest.requester._id);
      const recipient = await User.findById(followRequest.recipient._id);

      if (!recipient.followers.some(f => f.toString() === requester._id.toString())) {
        recipient.followers.push(requester._id);
      }
      if (!requester.following.some(f => f.toString() === recipient._id.toString())) {
        requester.following.push(recipient._id);
      }

      await recipient.save();
      await requester.save();

      followRequest.status = 'accepted';
    } else if (action === 'reject') {
      followRequest.status = 'rejected';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "accept" or "reject"'
      });
    }

    await followRequest.save();

    res.json({
      success: true,
      message: `Follow request ${action}ed`,
      request: followRequest
    });
  } catch (error) {
    console.error('Respond to follow request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

