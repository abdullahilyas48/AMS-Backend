const mongoose = require("mongoose");

const FlightBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'flights' },
  luggageWeight: Number,
  bookedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("flightbookings", FlightBookingSchema);
