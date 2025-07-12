const express = require('express');
const router = express.Router();
const Campaign = require('../model/Campaign');

// GET all campaigns
router.get('/', async (req, res) => {
  const { type, search } = req.query;
  let filter = {};
  if (type) filter.type = type;
  if (search) filter.title = { $regex: search, $options: 'i' };
  try {
    const campaigns = await Campaign.find(filter);
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new campaign
router.post('/', async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body);
    const saved = await newCampaign.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update campaign
router.put('/:id', async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Campaign not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Campaign.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// GET /api/campaigns/search?q=&category=&type=&status=
router.get('/search', async (req, res) => {
  try {
    const { q, category, type, status } = req.query;
    const query = {};

    if (q) {
      query.title = { $regex: q, $options: 'i' }; // tìm theo tiêu đề
    }

    if (category) {
      query.category_id = category;
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const campaigns = await Campaign.find(query);
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tìm kiếm chiến dịch' });
  }
});
// GET /api/campaigns/:id
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('organization_id')
      .populate('category_id');

    if (!campaign) {
      return res.status(404).json({ error: 'Không tìm thấy chiến dịch' });
    }

    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết chiến dịch' });
  }
});



module.exports = router;
