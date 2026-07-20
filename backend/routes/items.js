const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const { authRequired, adminRequired } = require('./_authMiddleware');

// Public: list items
router.get('/', async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
});

// Admin: add item
router.post('/', adminRequired, async (req, res) => {
  const { name, description, price, imageUrl, stock } = req.body;
  const item = await Item.create({ name, description, price, imageUrl, stock });
  res.json(item);
});

// Admin: update
router.put('/:id', adminRequired, async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.update(req.body);
  res.json(item);
});

// Admin: delete
router.delete('/:id', adminRequired, async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ ok: true });
});

module.exports = router;
