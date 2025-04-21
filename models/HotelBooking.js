const mongoose = require('mongoose');

const HotelBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  hotelName: String,
  roomType: String,
  price: Number,
  date: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('hotelbookings', HotelBookingSchema);