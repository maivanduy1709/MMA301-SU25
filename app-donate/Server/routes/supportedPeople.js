const express = require('express');
const router = express.Router();
const SupportedPerson = require('../model/SupportedPerson');

// Lấy danh sách
router.get('/', async (req, res) => {
  const list = await SupportedPerson.find();
  res.json(list);
});

// Lấy chi tiết theo _id hoặc id (tùy client truyền cái nào)
router.get('/:id', async (req, res) => {
  const person = await SupportedPerson.findOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
  if (!person) return res.status(404).json({ message: 'Not found' });
  res.json(person);
});

// Thêm mới
router.post('/', async (req, res) => {
  try {
    const person = new SupportedPerson(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cập nhật
router.put('/:id', async (req, res) => {
  const updated = await SupportedPerson.findOneAndUpdate(
    { $or: [{ _id: req.params.id }, { id: req.params.id }] },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// Xóa
router.delete('/:id', async (req, res) => {
  const result = await SupportedPerson.findOneAndDelete(
    { $or: [{ _id: req.params.id }, { id: req.params.id }] }
  );
  if (!result) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
