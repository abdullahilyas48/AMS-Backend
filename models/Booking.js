const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'vehicles' },
  date: String,
  time: String,
  destination: String,
  createdAt: { type: Date, default: Date.now }
});

const BookingModel = mongoose.model("bookings", BookingSchema);
module.exports = BookingModel;