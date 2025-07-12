const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: String,
  description: String,
  subtitle: String,
  type: { type: String, enum: ['fundraising', 'share', 'event'] },
  category_id: mongoose.Schema.Types.ObjectId,
  image: String,
  banner_image: String,
  target_amount: Number,
  raised_amount: Number,
  progress_percentage: Number,
  supporters_count: Number,
  days_left: Number,
  location: String,
  hashtag: String,
  start_date: Date,
  end_date: Date,
  status: { type: String, enum: ['active', 'completed', 'paused'] },
  organization_id: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
