// models/Organization.js
const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  short_name: String,
  description: String,
  logo: String,
  badge_type: { type: String, enum: ['verified', 'trusted', 'new'] },
  campaigns_count: { type: Number, default: 0 },
  total_raised: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', OrganizationSchema, 'Organizations');
