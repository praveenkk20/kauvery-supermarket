const express = require('express');
const path = require('path');
const fs = require('fs');
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
  const { name, description, category, price, discountPrice, stock } = req.body;
  let imageUrl = req.body.imageUrl;

  if (req.files?.image) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const image = req.files.image;
    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(uploadDir, fileName);
    await image.mv(filePath);
    imageUrl = `/uploads/${fileName}`;
  }

  const item = await Item.create({ name, description, category, price, discountPrice, imageUrl, stock });
  res.json(item);
});

// Admin: update
router.put('/:id', adminRequired, async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  const { name, description, category, price, discountPrice, stock } = req.body;
  let imageUrl = req.body.imageUrl || item.imageUrl;

  if (req.files?.image) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const image = req.files.image;
    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(uploadDir, fileName);
    await image.mv(filePath);
    imageUrl = `/uploads/${fileName}`;
  }

  await item.update({ name, description, category, price, discountPrice, imageUrl, stock });
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
