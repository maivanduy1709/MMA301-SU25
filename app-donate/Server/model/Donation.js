const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  personId: String,
  amount: Number,
  transactionId: { type: String, unique: true },
  time: Date
});

module.exports = mongoose.model('Donation', donationSchema);