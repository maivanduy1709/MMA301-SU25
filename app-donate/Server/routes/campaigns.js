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
router.post('/', async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body); // cần có lat, lng trong body
    const saved = await newCampaign.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT cập nhật
router.put('/:id', async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body, // cũng nhận lat/lng nếu có
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Campaign not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
 

    const campaign = await Campaign.findOne({ _id: req.params.id })
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



// GET single campaign
// router.get('/:id', async (req, res) => {
//   try {
//     const campaign = await Campaign.findById(req.params.id);
//     if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
//     res.json(campaign);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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
    const { q, category, type, status, tag } = req.query;
    const query = {};

    if (q) {
      query.title = { $regex: q, $options: 'i' };
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

    // 🔍 THÊM phần này để lọc theo tags (chứa 1 tag cụ thể)
    if (tag) {
      query.tags = { $in: [tag] }; // tìm các campaign có tag đó
    }

    const campaigns = await Campaign.find(query);
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tìm kiếm chiến dịch' });
  }
});

// GET /api/campaigns/:id

router.post('/', async (req, res) => {
  try {
    // Khởi tạo campaign mới từ request body
    const newCampaign = new Campaign({
      _id: req.body._id, // nếu không có thì MongoDB sẽ tự tạo
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      type: req.body.type,
      category_id: req.body.category_id,
      organization_id: req.body.organization_id,
      image: req.body.image,
      banner_image: req.body.banner_image,
      goal_amount: req.body.goal_amount,
      current_amount: req.body.current_amount || 0,
      progress_percentage: req.body.progress_percentage || 0,
      supporters_count: req.body.supporters_count || 0,
      days_left: req.body.days_left || 0,
      location: req.body.location,
      lat: req.body.lat,
      lng: req.body.lng,
      hashtag: req.body.hashtag,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      status: req.body.status || 'active',
      tags: req.body.tags || [],
      created_by: req.body.created_by
    });

    // Lưu vào cơ sở dữ liệu
    const saved = await newCampaign.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error('Lỗi tạo chiến dịch:', err.message);
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
