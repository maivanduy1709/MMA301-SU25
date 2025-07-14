const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  type: { type: String, enum: ['fundraising', 'share', 'event', 'highlighted'] }, // thêm nếu có type khác
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

  image: String,
  banner_image: String,

  goal_amount: Number,           // 🎯 khớp với ảnh của bạn
  current_amount: Number,        // 🎯 khớp với ảnh của bạn
  progress_percentage: Number,   // optional nếu bạn muốn tính progress động

  supporters_count: Number,
  days_left: Number,

  location: String,
  lat: Number,
  lng: Number,

  hashtag: String,
  start_date: Date,
  end_date: Date,

  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'Đang diễn ra', 'Đã hoàn thành'] // thêm enum tiếng Việt nếu bạn dùng
  },

  tags: [String],

  created_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
