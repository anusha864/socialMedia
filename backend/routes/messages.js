const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID, receiver ID, and content are required'
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself'
      });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'username photo');
    await message.populate('receiver', 'username photo');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all unique users the current user has messaged or received messages from
    const sentMessages = await Message.distinct('receiver', { sender: userId });
    const receivedMessages = await Message.distinct('sender', { receiver: userId });
    
    // Combine and get unique user IDs
    const allUserIds = [...new Set([
      ...sentMessages.map(id => id.toString()),
      ...receivedMessages.map(id => id.toString())
    ])];

    // Get last message for each conversation
    const conversations = await Promise.all(
      allUserIds.map(async (otherUserId) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'username photo')
          .populate('receiver', 'username photo');

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          sender: otherUserId,
          receiver: userId,
          read: false
        });

        const otherUser = await User.findById(otherUserId).select('username photo');
        
        if (!otherUser) return null;

        const senderId = lastMessage?.sender?._id?.toString() || lastMessage?.sender?.toString();
        const isYou = senderId === userId?.toString();

        return {
          user: {
            id: otherUser._id,
            username: otherUser.username,
            photo: otherUser.photo
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: isYou ? 'you' : 'them',
            createdAt: lastMessage.createdAt
          } : null,
          unreadCount
        };
      })
    );

    // Filter out null values
    const validConversations = conversations.filter(conv => conv !== null);

    // Sort by last message time
    validConversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json({
      success: true,
      conversations: validConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get messages between two users
router.get('/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (!userId || !otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .populate('sender', 'username photo')
      .populate('receiver', 'username photo')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      messages: messages || []
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

