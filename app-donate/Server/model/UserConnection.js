const mongoose = require("mongoose");

const userConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  avatar: {
    type: String,
    default: "https://via.placeholder.com/60x60/CCCCCC/FFFFFF?text=U"
  },
  total_donated: {
    type: Number,
    default: 0
  },
  campaigns_supported: {
    type: Number,
    default: 0
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("UserConnection", userConnectionSchema, "UserConnections");
