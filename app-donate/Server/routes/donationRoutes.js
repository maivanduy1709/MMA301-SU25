const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    donor_name: {
      type: String,
      default: "Ẩn danh",
    },
    donor_email: String,
    donor_phone: String,
    message: String,
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Donation", donationSchema);
