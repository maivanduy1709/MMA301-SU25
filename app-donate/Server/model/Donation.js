// models/Donation.js
const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
  },
  donor_name: {
    type: String,
    required: true,
  },
  donor_email: {
    type: String,
    required: true,
  },
  donor_phone: {
    type: String,
    required: true,
  },
  is_anonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Donation', DonationSchema, 'Donations');
