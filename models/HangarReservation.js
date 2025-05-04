const mongoose = require('mongoose');

const HangarReservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'hangarspots', required: true },
  ownerName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('hangarreservations', HangarReservationSchema); 
