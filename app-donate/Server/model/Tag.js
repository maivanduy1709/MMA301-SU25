const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  label: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Tag', TagSchema);
