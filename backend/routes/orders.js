const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { authRequired, adminRequired } = require('./_authMiddleware');

router.get('/', adminRequired, async (req, res) => {
  const orders = await Order.findAll({ order: [['id', 'DESC']] });
  res.json(orders);
});

router.post('/', authRequired, async (req, res) => {
  const { userId, items, total, shippingAddress } = req.body;
  const order = await Order.create({
    userId: userId || req.user.id,
    items,
    total,
    shippingAddress
  });
  res.json(order);
});

router.put('/:id', adminRequired, async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  await order.update(req.body);
  res.json(order);
});

module.exports = router;
