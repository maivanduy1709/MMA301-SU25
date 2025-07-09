// Server/models/Campaign.js
const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  goal_amount: Number,
  current_amount: Number,
  start_date: Date,
  end_date: Date,
  created_by: String,
  created_at: Date,
  address: String,
  image: String,
  status: String,
});

module.exports = mongoose.model("Campaign", campaignSchema);
