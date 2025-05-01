const mongoose = require('mongoose');

const HangarSpotSchema = new mongoose.Schema({
  number: { type: String, required: true },
  terminalLocation: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('hangarspots', HangarSpotSchema);