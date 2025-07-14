// models/DonationInit.js
const mongoose = require('mongoose');

const donationInitSchema = new mongoose.Schema({
  donationId: { type: String, required: true, unique: true },
  campaignId: { type: String, required: true },
  amount: { type: Number},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DonationInit', donationInitSchema);
