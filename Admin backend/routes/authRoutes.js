const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@parknspot.com';
const ADMIN_PASSWORD = 'Admin123!';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    // Check hardcoded admin first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = generateToken('admin');
      return res.json({
        success: true,
        message: 'Login successful',
        data: { token, user: { id: 'admin', name: 'Admin', email: ADMIN_EMAIL, role: 'admin' } },
      });
    }

    // Regular DB login
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (user.status === 'INACTIVE')
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });

    user.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'user' });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, data: { token, user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;
    if (setupKey !== process.env.ADMIN_SETUP_KEY && setupKey !== 'parkNSpotAdmin2024')
      return res.status(403).json({ success: false, message: 'Invalid setup key' });

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin)
      return res.status(409).json({ success: false, message: 'Admin already exists.' });

    const admin = await User.create({ name, email, password, role: 'admin' });
    const token = generateToken(admin._id);
    res.status(201).json({ success: true, data: { token, user: admin } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;