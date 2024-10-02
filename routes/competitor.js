const express = require('express');
const router = express.Router();
const CompetitorAccount = require('../models/CompetitorAccount');
const { protect } = require('../middleware/auth');

// Submit Competitor Account
router.post('/', protect, async (req, res) => {
  const { dateRange, amount, transactionId ,aadhar} = req.body;

  if (!dateRange || !amount || !transactionId || !aadhar) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const competitor = await CompetitorAccount.create({
      user: req.user._id,
      dateRange,
      amount,
      transactionId,
      aadhar
    });

    res.status(201).json(competitor);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optionally, get user's competitor accounts
router.get('/', protect, async (req, res) => {
  try {
    const competitors = await CompetitorAccount.find({ user: req.user._id });
    res.json(competitors);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
