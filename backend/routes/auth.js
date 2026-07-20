const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const User = require('../models/user');

// Email/password signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, phone });
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin signup (requires ADMIN_SECRET env variable)
router.post('/signup-admin', async (req, res) => {
  const { name, email, password, phone, adminSecret } = req.body;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin secret' });
  }

  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, phone, isAdmin: true });
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Email/password login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token, userId: user.id });
});

// Phone OTP placeholders
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ ok: true, otp });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  console.log(`Verify OTP ${otp} for ${phone}`);
  let user = await User.findOne({ where: { phone } });
  if (!user) user = await User.create({ phone });
  const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token, userId: user.id });
});

// Google OAuth placeholder
router.get('/google', (req, res) => {
  res.json({ message: 'Open Google OAuth URL (configure GOOGLE_CLIENT_ID/SECRET in .env and add real route).' });
});

module.exports = router;
