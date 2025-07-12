const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "", // có thể dùng URL mặc định
    },
    total_donated: {
      type: Number,
      default: 0,
    },
    campaigns_supported: {
      type: Number,
      default: 0,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    resetCode: String,
    resetCodeExpiration: Date,
  },
  {
    timestamps: true, // sẽ tạo tự động createdAt và updatedAt
  }
);

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
