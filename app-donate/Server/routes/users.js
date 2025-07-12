const express = require('express');
const router = express.Router();
const UserConnection = require('../model/UserConnection');

// GET all user connections
router.get('/', async (req, res) => {
  try {
    const users = await UserConnection.find().sort({ created_at: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user connection
router.get('/:id', async (req, res) => {
  try {
    const user = await UserConnection.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new user connection
router.post('/', async (req, res) => {
  const { name, email, avatar, total_donated, campaigns_supported, is_verified } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Tên người dùng là bắt buộc' });
  }

  try {
    const newUser = new UserConnection({
      name,
      email,
      avatar,
      total_donated,
      campaigns_supported,
      is_verified
    });

    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update user connection
router.put('/:id', async (req, res) => {
  try {
    const updated = await UserConnection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user connection
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await UserConnection.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET stats of a specific user
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await UserConnection.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      name: user.name,
      total_donated: user.total_donated,
      campaigns_supported: user.campaigns_supported,
      is_verified: user.is_verified
    });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy thống kê người dùng' });
  }
});

module.exports = router;
