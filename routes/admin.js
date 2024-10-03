const express = require('express');
const router = express.Router();
const CompetitorAccount = require('../models/CompetitorAccount');
const LiveAccount = require('../models/LiveAccount');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Get all Competitor Accounts
router.get('/competitors', protect, admin, async (req, res) => {
  try {
    const competitors = await CompetitorAccount.find().populate('user', 'name email number imageFront.imageUrl imageFront.cloudinaryId');
    // Format response
    const formatted = competitors.map(c => ({
      name: c.user.name,
      email: c.user.email,
      number: c.user.number,
      dateRange: c.dateRange,
      imageFront:{
        imageUrl:c.user.imageFront.imageUrl || "no image",
        cloudinaryId:c.user.imageFront.cloudinaryId || "No Cloudinary ID"
      },
      transactionId: c.transactionId,
      amount: c.amount,
      aadhar:c.aadhar
    }));
    res.json(formatted);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all Live Accounts
router.get('/live-accounts', protect, admin, async (req, res) => {
  try {
    const liveAccounts = await LiveAccount.find().populate('user', 'name email number imageFront.imageUrl imageFront.cloudinaryId');
    // Format response
    const formatted = liveAccounts.map(l => ({
      user: {
        name: l.user.name,
        email: l.user.email,
        number: l.user.number,
        imageFront:{
          imageUrl:l.user.imageFront.imageUrl || "no image",
          cloudinaryId:l.user.imageFront.cloudinaryId || "No Cloudinary ID"
        },
      },
      amount: l.amount,
      transactionId: l.transactionId,
      aadhar:l.aadhar
    }));
    res.json(formatted);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optionally, admin can get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
