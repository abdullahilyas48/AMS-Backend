const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema({
  flightNumber: String,
  airline: String,
  from: String,
  to: String,
  date: String,
  time: String,           // departure time
  arrivalTime: String,    // ✨ new field
  flightClass: String,
  price: Number,
  maxLuggageWeight: Number,
  seatsAvailable: Number,
  available: Boolean
});


module.exports = mongoose.model("flights", FlightSchema);
