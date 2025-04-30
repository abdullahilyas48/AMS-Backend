const mongoose = require('mongoose');

const HangarReservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'HangarSpot', required: true },
  ownerName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('hangarreservations', HangarReservationSchema); 

