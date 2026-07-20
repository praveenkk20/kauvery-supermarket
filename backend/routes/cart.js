const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const { authRequired } = require('./_authMiddleware');

// Get cart for current user
router.get('/', authRequired, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json(user.cart || []);
});

// Add item to cart
router.post('/add', authRequired, async (req, res) => {
  const { itemId, qty = 1 } = req.body;
  const user = await User.findByPk(req.user.id);
  const item = await Item.findByPk(itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const cart = user.cart || [];
  const existing = cart.find(c => c.itemId === itemId);
  if (existing) existing.qty += qty; else cart.push({ itemId, qty, name: item.name, price: item.price });
  user.cart = cart;
  await user.save();
  res.json(cart);
});

// Remove item
router.post('/remove', authRequired, async (req, res) => {
  const { itemId } = req.body;
  const user = await User.findByPk(req.user.id);
  const cart = (user.cart || []).filter(c => c.itemId !== itemId);
  user.cart = cart;
  await user.save();
  res.json(cart);
});

module.exports = router;
