const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Category = require('../models/category');
const { adminRequired } = require('./_authMiddleware');

router.get('/', async (req, res) => {
  const categories = await Category.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
  res.json(categories);
});

router.post('/', adminRequired, async (req, res) => {
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

  const category = await Category.create({
    name: req.body.name,
    description: req.body.description,
    imageUrl,
    isActive: req.body.isActive != null ? req.body.isActive === 'true' || req.body.isActive === true : true,
    parentId: req.body.parentId ? Number(req.body.parentId) : null,
    sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0
  });
  res.json(category);
});

router.put('/:id', adminRequired, async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Not found' });
  let imageUrl = req.body.imageUrl || category.imageUrl;
  if (req.files?.image) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const image = req.files.image;
    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(uploadDir, fileName);
    await image.mv(filePath);
    imageUrl = `/uploads/${fileName}`;
  }

  await category.update({
    name: req.body.name || category.name,
    description: req.body.description ?? category.description,
    imageUrl,
    isActive: req.body.isActive == null ? category.isActive : (req.body.isActive === 'true' || req.body.isActive === true),
    parentId: req.body.parentId != null ? Number(req.body.parentId) : category.parentId,
    sortOrder: req.body.sortOrder != null ? Number(req.body.sortOrder) : category.sortOrder
  });
  res.json(category);
});

router.delete('/:id', adminRequired, async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Not found' });
  await category.destroy();
  res.json({ ok: true });
});

module.exports = router;
