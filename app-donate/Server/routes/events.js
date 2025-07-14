const express = require('express');
const router = express.Router();
const Event = require('../model/Event');

// GET: lấy toàn bộ sự kiện
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ start_date: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách sự kiện' });
  }
});

// GET: chi tiết một sự kiện
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Sự kiện không tồn tại' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết sự kiện' });
  }
});

// POST: tạo mới sự kiện
router.post('/', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ message: 'Tạo sự kiện thành công', event: newEvent });
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi tạo sự kiện', details: err.message });
  }
});

// PUT: cập nhật sự kiện
router.put('/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
    res.json({ message: 'Cập nhật thành công', event: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: xóa sự kiện
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
    res.json({ message: 'Đã xóa sự kiện' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: đăng ký tham gia sự kiện
router.post('/:id/register', async (req, res) => {
  try {
    const { user_name, user_email, user_phone, note } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Sự kiện không tồn tại' });

    // Check deadline
    const now = new Date();
    if (event.registration_deadline && now > event.registration_deadline) {
      return res.status(400).json({ error: 'Đã hết hạn đăng ký' });
    }

    // Check số lượng tham gia tối đa
    if (event.max_participants && event.participants_count >= event.max_participants) {
      return res.status(400).json({ error: 'Sự kiện đã đủ người tham gia' });
    }

    const newParticipant = { user_name, user_email, user_phone, note };
    event.participants.push(newParticipant);
    event.participants_count += 1;

    await event.save();
    res.status(200).json({ message: 'Đăng ký thành công', participant: newParticipant });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi đăng ký sự kiện', details: err.message });
  }
});

module.exports = router;
