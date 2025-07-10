const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    account: String,
    amount: Number,
    type: String,
    time: Date,
    message: String,
    raw: Object, // chứa toàn bộ dữ liệu chi tiết như gateway, nội dung,...
  },
  {
    timestamps: true, // thêm createdAt, updatedAt tự động
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);