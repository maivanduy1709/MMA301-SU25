const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user_name: { type: String, required: true },
  user_email: { type: String },
  user_phone: { type: String },
  note: { type: String }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  address: String,
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  image: { type: String, default: '' },
  participants_count: { type: Number, default: 0 },
  max_participants: { type: Number, default: 100 },
  registration_deadline: { type: Date },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  created_at: { type: Date, default: Date.now },
  participants: [participantSchema]
});

module.exports = mongoose.model('Event', eventSchema, 'Events');
