const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { adminRequired } = require('./_authMiddleware');

router.get('/', adminRequired, async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'phone', 'isAdmin', 'isActive', 'isBlocked', 'address', 'photoUrl', 'createdAt'],
    order: [['id', 'DESC']]
  });
  res.json(users);
});

router.put('/:id', adminRequired, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  await user.update(req.body);
  res.json(user);
});

module.exports = router;
