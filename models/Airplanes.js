const mongoose = require('mongoose');

const AirplaneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'hangarspots', required: true },
  manufacturer: { type: String, required: true }, // A1, B2, etc.
  type: { type: String, required: true },
  regNo: { type: String, required: true }
});

module.exports = mongoose.model('airplanes', AirplaneSchema);



