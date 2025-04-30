const mongoose = require("mongoose");

const DutySchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  staffName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  taskDescription: { type: String, required: true },
  assigned: { type: Boolean, default: false },
  frequency: {  // This is the field for repeating duties
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  location: { type: String, required: true }  // New field for location
});

module.exports = mongoose.model("duties", DutySchema);
