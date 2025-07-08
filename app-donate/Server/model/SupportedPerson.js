const mongoose = require('mongoose');

const supportedPersonSchema = new mongoose.Schema({
  id: String,
  name: String,
  birthYear: String,
  address: String,
  province: String,
  district: String,
  area: String,
  status: String
});

module.exports = mongoose.model('SupportedPerson', supportedPersonSchema, 'supportedPeople');
// 👆 👆 👆 👆 👆 👆 👈 BẮT BUỘC chỉ định tên collection chính xác ở đây
