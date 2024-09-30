const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

dotenv.config();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send OTP for verification
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, number, password } = req.body;

  if (!name || !email || !number || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // User exists but not verified, resend OTP
        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await existingUser.save();

        // Send OTP email
        await sendEmail(
          email,
          'Verify Your Account',
          `Your OTP for account verification is ${otp}. It will expire in 10 minutes.`
        );

        return res.status(200).json({ message: 'OTP resent to email' });
      }
    }

    // Create user with isVerified = false
    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      number,
      password,
      isVerified: false,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send OTP email
    await sendEmail(
      email,
      'Verify Your Account',
      `Your OTP for account verification is ${otp}. It will expire in 10 minutes.`
    );

    res.status(201).json({
      message: 'Registration successful. Please verify your email using the OTP sent.',
      userId: user._id
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for registration
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  try {
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or email' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email to login' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      token: generateToken(user._id)
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/forget-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forget-password', async (req, res) => {
  const { email } = req.body;

  if (!email ) {
    return res.status(400).json({ message: 'Please provide your email' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: 'User does not exist or is not verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      'Password Reset Request',
      `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`
    );

    res.status(200).json({ message: 'OTP sent to your email for password reset' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
  }

  try {
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or email' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
