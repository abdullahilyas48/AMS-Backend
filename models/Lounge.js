const mongoose = require('mongoose');

const LoungeSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('lounges', LoungeSchema);
