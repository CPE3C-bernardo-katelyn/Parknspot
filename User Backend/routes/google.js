const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Start Google OAuth
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    const token = generateToken(req.user._id);
    const name = encodeURIComponent(req.user.name);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}&name=${name}`);
  }
);

module.exports = router;