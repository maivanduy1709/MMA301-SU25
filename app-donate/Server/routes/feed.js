// routes/feed.js
const express = require('express');
const router = express.Router();
const FeedItem = require('../model/FeedItem');

router.get('/', async (req, res) => {
  try {
    const feedItems = await FeedItem.find({})
      .sort({ created_at: -1 })
      .limit(50); // hoặc dùng phân trang
    res.json({ feed: feedItems });
  } catch (error) {
    console.error('❌ Lỗi lấy feed:', error);
    res.status(500).json({ error: 'Không thể lấy dữ liệu feed.' });
  }
});

module.exports = router;
