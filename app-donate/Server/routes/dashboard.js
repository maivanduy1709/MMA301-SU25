// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const Campaign = require('../model/Campaign');
const Donation = require('../model/Donation');
const User = require('../model/User');

// API: /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalCampaigns,
      totalRaisedResult,
      totalSupporters,
      activeCampaigns,
      completedCampaigns
    ] = await Promise.all([
      Campaign.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      User.countDocuments(),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ status: 'completed' }),
    ]);

    const totalRaised = totalRaisedResult[0]?.total || 0;

    return res.status(200).json({
      stats: {
        total_campaigns: totalCampaigns,
        total_raised: totalRaised,
        total_supporters: totalSupporters,
        active_campaigns: activeCampaigns,
        completed_campaigns: completedCampaigns
      }
    });
  } catch (err) {
    console.error('Lỗi khi lấy dashboard stats:', err);
    return res.status(500).json({ error: 'Không thể lấy thống kê tổng quan' });
  }
});

module.exports = router;
