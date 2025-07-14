// routes/initDonation.js
const express = require('express');
const router = express.Router();
const DonationInit = require('../model/DonationInit');
const Transaction = require('../model/Transaction'); // import model

router.post('/initiate-donation', async (req, res) => {
  const { donationId, campaignId, amount, createdAt } = req.body;
   console.log("📥 Đã nhận request initiate-donation:", req.body);

  if (!donationId || !campaignId ) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const existing = await DonationInit.findOne({ donationId });
    if (existing) {
      return res.status(200).json({ message: 'Donation đã tồn tại' });
    }

    const newDonation = new DonationInit({
      donationId,
      campaignId,
      amount,
      createdAt: createdAt || new Date(),
    });

    await newDonation.save();
    res.status(201).json({ message: 'Đã khởi tạo donation', donation: newDonation });
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo donation:', error);
    res.status(500).json({ error: 'Lỗi server khi lưu donation' });
  }
});


router.get('/check-donation/:donationId', async (req, res) => {
  const { donationId } = req.params;
  console.log("🔍 Kiểm tra donation thực:", donationId);

  if (!donationId) {
    return res.status(400).json({ status: 'invalid_request', message: 'Thiếu donationId' });
  }

  try {
    // Bước 1: Tìm trong bảng transaction xem có ai chuyển khoản với nội dung trùng donationId không
    const matchedTransaction = await Transaction.findOne({
      'raw.description': { $regex: new RegExp(donationId, 'i') }
    });

    if (matchedTransaction) {
      return res.json({ status: 'confirmed' });
    }

    return res.json({ status: 'pending' });
  } catch (error) {
    console.error("❌ Lỗi check-donation thực:", error);
    return res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
});


module.exports = router;
