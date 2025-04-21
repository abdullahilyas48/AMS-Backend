const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema({
  number: { type: String, required: true }, // A1, B2, etc.
  terminalLocation: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('parkings', ParkingSpotSchema);
