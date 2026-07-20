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
  const itemId = Number(req.body.itemId);
  const qty = Number(req.body.qty || 1);
  if (!Number.isInteger(itemId) || itemId <= 0 || qty <= 0) {
    return res.status(400).json({ error: 'Invalid item or quantity.' });
  }
  const user = await User.findByPk(req.user.id);
  const item = await Item.findByPk(itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const cart = user.cart || [];
  const itemPrice = item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price;
  const existing = cart.find(c => c.itemId === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ itemId, qty, name: item.name, price: itemPrice, originalPrice: item.price, discountPrice: item.discountPrice });
  }
  user.cart = cart;
  await user.save();
  res.json(cart);
});

router.post('/update', authRequired, async (req, res) => {
  const itemId = Number(req.body.itemId);
  const qty = Number(req.body.qty);
  if (!Number.isInteger(itemId) || itemId <= 0 || qty < 0) {
    return res.status(400).json({ error: 'Invalid item or quantity.' });
  }
  const user = await User.findByPk(req.user.id);
  const cart = user.cart || [];
  const existing = cart.find(c => c.itemId === itemId);
  if (!existing) return res.status(404).json({ error: 'Item not found in cart.' });
  if (qty === 0) {
    user.cart = cart.filter(c => c.itemId !== itemId);
  } else {
    existing.qty = qty;
  }
  await user.save();
  res.json(user.cart);
});

// Remove item
router.post('/remove', authRequired, async (req, res) => {
  const itemId = Number(req.body.itemId);
  const user = await User.findByPk(req.user.id);
  const cart = (user.cart || []).filter(c => c.itemId !== itemId);
  user.cart = cart;
  await user.save();
  res.json(cart);
});

module.exports = router;
