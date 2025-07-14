const express = require('express');
const router = express.Router();
const Campaign = require('../model/Campaign');
const Organization = require('../model/Organization');

// GET /api/explore?q=&location=&category=&limit=
router.get('/', async (req, res) => {
  try {
    const { q, location, category, limit = 6 } = req.query;
    const filter = {};

    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (category) {
      filter.tags = { $in: [category.toLowerCase()] };
    }

    // 🔥 Trending campaigns
    const trendingCampaigns = await Campaign.find(filter)
      .sort({ supporters_count: -1, created_at: -1 })
      .limit(Number(limit));

    // 🏆 Top organizations
    const topOrganizations = await Organization.find({ is_active: true })
      .sort({ campaigns_count: -1, total_raised: -1 })
      .limit(Number(limit));

    // 📍 Map campaigns with location
    const mapCampaigns = await Campaign.find({
      location: { $exists: true, $ne: '' },
      ...filter
    })
      .select('title location lat lng image')
      .limit(50); // limit map results

    res.json({
      filters: { q, location, category },
      trending_campaigns: trendingCampaigns,
      top_organizations: topOrganizations,
      map_campaigns: mapCampaigns
    });
  } catch (err) {
    console.error('❌ Lỗi API Explore:', err.message);
    res.status(500).json({ error: 'Không thể tải dữ liệu khám phá' });
  }
});

module.exports = router;
