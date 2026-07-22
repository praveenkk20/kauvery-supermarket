const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const { authRequired, adminRequired } = require('./_authMiddleware');

router.get('/', adminRequired, async (req, res) => {
  const reviews = await Review.findAll({ order: [['id', 'DESC']] });
  res.json(reviews);
});

router.post('/', authRequired, async (req, res) => {
  const review = await Review.create({
    itemId: req.body.itemId,
    userName: req.body.userName || 'Customer',
    rating: req.body.rating || 5,
    comment: req.body.comment,
    status: 'Pending'
  });
  res.json(review);
});

router.put('/:id', adminRequired, async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ error: 'Not found' });
  await review.update(req.body);
  res.json(review);
});

router.delete('/:id', adminRequired, async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ error: 'Not found' });
  await review.destroy();
  res.json({ ok: true });
});

module.exports = router;
