// models/FeedItem.js
const mongoose = require('mongoose');

const FeedItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['donation', 'campaign_created', 'thank_you', 'event', 'system_announcement'],
    required: true
  },
  title: String,
  content: String,
  image: String,
  video: String,
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  user_name: String, // người dùng đóng góp
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeedItem', FeedItemSchema);
