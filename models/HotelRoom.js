const mongoose = require('mongoose');

const HotelRoomSchema = new mongoose.Schema({
  hotelName: String,
  roomType: String,
  price: Number,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('hotelrooms', HotelRoomSchema);