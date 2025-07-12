// routes/organizations.js
const express = require('express');
const router = express.Router();
const Organization = require('../model/Organization');

// GET /api/organizations
router.get('/', async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.status(200).json({ organizations: orgs });
  } catch (err) {
    console.error('Lỗi khi lấy tổ chức:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách tổ chức' });
  }
});

module.exports = router;
