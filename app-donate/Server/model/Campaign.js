const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  type: { 
    type: String, 
    enum: ['fundraising', 'share', 'event', 'highlighted'],
    required: true
  },
  
  // 🔄 Chuyển từ ObjectId sang String để dễ sử dụng
  category_id: { 
    type: String, 
    ref: 'Category' // Vẫn giữ reference nếu cần populate
  },
  organization_id: { 
    type: String, 
    ref: 'Organization' // Vẫn giữ reference nếu cần populate
  },
  
  image: String,
  banner_image: String,
  
  goal_amount: Number,
  current_amount: { type: Number, default: 0 },
  progress_percentage: Number,
  supporters_count: { type: Number, default: 0 },
  days_left: Number,
  
  location: String,
  lat: Number,
  lng: Number,
  
  hashtag: String,
  start_date: Date,
  end_date: Date,
  
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'pending', 'cancelled'],
    default: 'active'
  },
  
  tags: [String],
  
  created_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware để tự động cập nhật updated_at
CampaignSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);