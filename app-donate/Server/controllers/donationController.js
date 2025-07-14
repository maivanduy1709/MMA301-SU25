const Donation = require('../model/Donation');

// Nhận webhook
exports.receiveWebhook = async (req, res) => {
  const { amount, description, transaction_id, time } = req.body;

  if (!amount || !description || !transaction_id) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    const exists = await Donation.findOne({ transactionId: transaction_id });
    if (exists) return res.status(200).json({ message: 'Đã ghi nhận' });

    const donation = new Donation({
      personId: description.trim(),
      amount,
      transactionId: transaction_id,
      time: time ? new Date(time) : new Date(),
    });

    await donation.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi khi lưu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách
exports.getAllDonations = async (req, res) => {
  try {
    const data = await Donation.find().sort({ time: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách' });
  }
};

// Lấy theo ID
exports.getByPersonId = async (req, res) => {
  try {
    const personId = req.params.personId;
    const data = await Donation.find({ personId }).sort({ time: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tìm thấy' });
  }
};