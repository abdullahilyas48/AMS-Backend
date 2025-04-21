const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  available: { type: Boolean, default: true }
});

const VehicleModel = mongoose.model("vehicles", VehicleSchema);
module.exports = VehicleModel;