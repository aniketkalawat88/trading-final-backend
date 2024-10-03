const cloudinary = require('cloudinary');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require("../middleware/cloudinary-middleware");

dotenv.config();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};


router.post('/register',upload.single('image'), async (req, res) => {
  const { name, email, number, password  } = req.body;

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
    let result = await cloudinary.v2.uploader.upload(req.file.path)
    console.log('Cloudinary Upload Result:', result);
    const  imageUrl = result.secure_url;
    const cloudinaryId = result.public_id;
    const user = await User.create({
      name,
      email,
      number,
      password,
      isVerified: false,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      imageFront: {
        imageUrl: imageUrl, 
        cloudinaryId: cloudinaryId
    },
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

router.get('/checkuser', authMiddleware, async (req, res) => {
  try {
    // At this point, req.user is available from the authMiddleware
    const { role } = req.user;

    res.status(200).json({
      isAdmin: role === 'admin',
      isUser: role === 'user',
      role, // Optional: Return the role as well
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
