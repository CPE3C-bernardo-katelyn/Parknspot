const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name, email, password,
      verificationToken: crypto.createHash('sha256').update(token).digest('hex'),
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
      from: `"Park 'n Spot" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify your Park\'n Spot account',
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. Link expires in 24 hours.</p>`,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isVerified) return res.json({ message: 'Already verified.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
      from: `"Park 'n Spot" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify your Park\'n Spot account',
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email.' });
    }

    // If account has a googleId, always redirect to Google
    if (user.googleId) {
      return res.status(401).json({
        googleAccount: true,
        message: 'This account uses Google Sign-In.'
      });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/me
router.put('/me', protect, async (req, res) => {
  try {
    const { name, username, email, mobile } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (username !== undefined) user.username = username;
    if (email) user.email = email;
    if (mobile !== undefined) user.mobile = mobile;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      mobile: updated.mobile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) return res.status(400).json({ message: 'Google accounts cannot change password here.' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/locations
router.get('/locations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedLocations');
    res.json({ success: true, data: user.savedLocations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/locations
router.post('/locations', protect, async (req, res) => {
  try {
    const { name, info, icon } = req.body;
    const user = await User.findById(req.user._id);
    user.savedLocations.push({ name, info, icon });
    await user.save();
    res.status(201).json({ success: true, data: user.savedLocations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/auth/locations/:id
router.delete('/locations/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedLocations = user.savedLocations.filter(
      loc => loc._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ success: true, data: user.savedLocations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/history
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('parkingHistory');
    res.json({ success: true, data: user.parkingHistory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/history
router.post('/history', protect, async (req, res) => {
  try {
    const { name, duration, date, status } = req.body;
    const user = await User.findById(req.user._id);
    user.parkingHistory.unshift({ name, duration, date, status });
    await user.save();
    res.status(201).json({ success: true, data: user.parkingHistory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  console.log('📧 Forgot password hit:', req.body);
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // Always respond with success to prevent email enumeration
    if (!user || user.googleId) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Park 'n Spot" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request – Park\'n Spot',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
          <h2 style="color:#660000;margin-bottom:8px;">Park 'n Spot</h2>
          <h3 style="color:#111827;">Reset Your Password</h3>
          <p style="color:#374151;font-size:14px;">You requested a password reset. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#660000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">Reset Password</a>
          <p style="color:#6b7280;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:11px;">Park 'n Spot &mdash; Smart Parking</p>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;