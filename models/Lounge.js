const mongoose = require('mongoose');

const LoungeSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  bookedCount: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Lounge', LoungeSchema);
