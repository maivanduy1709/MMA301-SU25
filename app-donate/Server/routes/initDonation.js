const express = require('express');
const router = express.Router();
const DonationInit = require('../model/DonationInit');
const Transaction = require('../model/Transaction');

// Hàm trích mã donationId bắt đầu bằng don/DON
function extractDonationId(text) {
  const match = text?.match(/don[a-zA-Z0-9]+/i);
  return match ? match[0] : null;
}

// --- INITIATE DONATION ---
router.post('/initiate-donation', async (req, res) => {
  const { donationId, campaignId, amount, createdAt } = req.body;
  console.log("📥 Đã nhận request initiate-donation:", req.body);

  if (!donationId || !campaignId) {
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
      status: 'pending'
    });

    await newDonation.save();
    res.status(201).json({ message: 'Đã khởi tạo donation', donation: newDonation });
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo donation:', error);
    res.status(500).json({ error: 'Lỗi server khi lưu donation' });
  }
});

// --- CHECK DONATION STATUS ---
router.get('/check-donation/:donationId', async (req, res) => {
  const { donationId } = req.params;
  console.log("🔍 Kiểm tra donation thực:", donationId);

  if (!donationId) {
    return res.status(400).json({ status: 'invalid_request', message: 'Thiếu donationId' });
  }

  try {
    const donationRegex = new RegExp(donationId, 'i');

    const matchedTransaction = await Transaction.findOne({
      $or: [
        { description: { $regex: donationRegex } },
        { content: { $regex: donationRegex } },
        { 'raw.description': { $regex: donationRegex } },
        { 'raw.content': { $regex: donationRegex } }
      ]
    });

    if (matchedTransaction) {
      // Nếu tìm thấy thì cập nhật luôn DonationInit thành confirmed
      await DonationInit.updateOne(
        { donationId: { $regex: donationRegex } },
        { $set: { status: 'confirmed', confirmedAt: new Date() } }
      );

      return res.json({ status: 'confirmed' });
    }

    return res.json({ status: 'pending' });
  } catch (error) {
    console.error("❌ Lỗi check-donation thực:", error);
    return res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
});

// --- XỬ LÝ GIAO DỊCH WEBHOOK TỪ NGÂN HÀNG ---
router.post('/webhook', async (req, res) => {
  const data = req.body;
  console.log('📩 Nhận Webhook:', data);

  const descriptionText = data.description || data.content || '';
  const donationId = extractDonationId(descriptionText);

  try {
    const newTx = new Transaction(data);
    await newTx.save();

    if (donationId) {
      await DonationInit.updateOne(
        { donationId: { $regex: new RegExp(donationId, 'i') } },
        { $set: { status: 'confirmed', confirmedAt: new Date() } }
      );

      console.log(`✅ Đã xác nhận donationId: ${donationId}`);
    }

    res.status(200).json({ message: 'Đã nhận và lưu giao dịch' });
  } catch (err) {
    console.error('❌ Lỗi lưu webhook hoặc cập nhật donation:', err);
    res.status(500).json({ message: 'Lỗi xử lý webhook' });
  }
});

module.exports = router;
