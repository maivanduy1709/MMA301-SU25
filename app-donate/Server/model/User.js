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
    resetCode: String,
    resetCodeExpiration: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "User");

module.exports = User;