const mongoose = require('mongoose');

const LoungeBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  loungeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lounge' },
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('loungebookings', LoungeBookingSchema);module