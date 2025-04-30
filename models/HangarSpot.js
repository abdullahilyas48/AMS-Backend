const mongoose = require('mongoose');

const HangarSpotSchema = new mongoose.Schema({
  number: { type: String, required: true }, // A1, B2, etc.
  terminalLocation: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('hangarspots', HangarSpotSchema);

