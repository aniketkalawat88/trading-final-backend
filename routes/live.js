const express = require('express');
const router = express.Router();
const LiveAccount = require('../models/LiveAccount');
const { protect } = require('../middleware/auth');

// Submit Live Account
router.post('/', protect, async (req, res) => {
  const { amount, transactionId  } = req.body;

  if (!amount || !transactionId) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const live = await LiveAccount.create({
      user: req.user._id,
      amount,
      transactionId,
    });
    
    res.status(201).json(live);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optionally, get user's live accounts
router.get('/', protect, async (req, res) => {
  try {
    const liveAccounts = await LiveAccount.find({ user: req.user._id });
    res.json(liveAccounts);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
