const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.post('/webhook/sepay', donationController.receiveWebhook);
router.get('/donations', donationController.getAllDonations);
router.get('/donations/:personId', donationController.getByPersonId);


const Donation = require('../model/Donation');

// POST /api/donations
router.post('/', async (req, res) => {
  try {
    const {
      campaign_id,
      amount,
      message,
      donor_name,
      donor_email,
      donor_phone,
      is_anonymous,
    } = req.body;

    // Kiểm tra dữ liệu cơ bản
    if (!campaign_id || !amount || !donor_name || !donor_email || !donor_phone) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const newDonation = new Donation({
      campaign_id,
      amount,
      message,
      donor_name,
      donor_email,
      donor_phone,
      is_anonymous,
    });

    await newDonation.save();
    res.status(201).json({ message: 'Quyên góp thành công', donation: newDonation });
  } catch (err) {
    console.error('Lỗi khi tạo quyên góp:', err);
    res.status(500).json({ error: 'Không thể tạo quyên góp' });
  }
});

module.exports = router;


module.exports = router;