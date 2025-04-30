const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
  fullName: { type: String, required: true },
  vehicleType: { type: String, required: true },
  licensePlate: { type: String, required: true },
  reservationDate: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

module.exports = mongoose.model('parkingreservations', ReservationSchema);

