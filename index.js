const express = require("express")
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose")
const cors = require ('cors')
const UserModel = require('./models/User')
const AdminModel = require('./models/Admin')
const { addPoints } = require('./services/RewardsService');
const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/AMS")
  .then(() => {
    console.log("✅ AMS database is connected");
  })
  .catch((err) => {
    console.log("❌ AMS database connection failed", err.message);
  });

app.listen(7798,()=>{
  console.log("✅ Server is running on http://localhost:7798");
})

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

const JWT_SECRET = 'token';
const saltRounds = 10;

app.post('/user-login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.json("No Records Exist.");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        return res.json({ message: "Success!", token });
      } else {
        return res.json("Wrong Password.");
      }
    } catch (err) {
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

  const authenticateToken = require('./middleware/auth');

app.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select('name email');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});


  app.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: "No Records Exist." });
      }

      if (password !== admin.password) {
        return res.status(401).json({ message: "Wrong Password." });
      }
  
      const token = jwt.sign(
        { adminId: admin._id, email: admin.email, role: "admin" },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      return res.status(200).json({
        message: "Success!",
        token,
        admin: {
          id: admin._id,
          email: admin.email
        }
      });
  
    } catch (err) {
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
app.post('/register-user', async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
      if (existingUser) {
  return res.json({ error: "User already exists" });
}
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = await UserModel.create({ ...req.body, password: hashedPassword });
    res.json(user);
  } catch (err) {
    res.json(err);
  }
});

app.post('/reset-user-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ Status: "Error", Error: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    if (user) {
      res.status(200).json({ Status: "Password updated successfully" });
    } else {
      res.status(404).json({ Status: "User not found" });
    }

  } catch (err) {
    res.status(500).json({ Status: "Error", Error: err.message });
  }
});

  const VehicleModel = require('./models/Vehicle');
  const BookingModel = require('./models/VehicleBooking');
  
  // 📥 Create Booking
  app.post('/book-vehicles', async (req, res) => {
    const { userId, vehicleId, date, time, destination } = req.body;
    try {
      const vehicle = await VehicleModel.findById(vehicleId);
      if (!vehicle || !vehicle.available) {
        return res.json({ error: "Vehicle not available" });
      }
  
      const booking = await BookingModel.create({
        userId,
        vehicleId,
        date,
        time,
        destination
      });
  
      await VehicleModel.findByIdAndUpdate(vehicleId, { available: false });

      await addPoints(userId, 'vehicle');
  
      res.json({ message: "Booking successful", booking });
    } catch (err) {
      res.status(500).json({ error: "Booking failed", details: err });
    }
  });

  app.delete('/cancel-vehicle-booking/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
  
    try {
      const booking = await BookingModel.findByIdAndDelete(bookingId);
  
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
  
      await VehicleModel.findByIdAndUpdate(booking.vehicleId, { available: true });
  
      res.json({ message: "Booking cancelled and vehicle is now available" });
    } catch (err) {
      res.status(500).json({ error: "Cancellation failed", details: err.message });
    }
  });
  
  
  // 📤 Get all available vehicles with optional price filter
  app.get('/vehicles', async (req, res) => {
    const maxPrice = req.query.maxPrice;
    const filter = maxPrice
      ? { available: true, price: { $lte: maxPrice } }
      : { available: true };
  
    try {
      const vehicles = await VehicleModel.find(filter);
      res.json(vehicles);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vehicles", details: err });
    }
  });  

  const HotelRoomModel = require('./models/HotelRoom');
const HotelBookingModel = require('./models/HotelBooking');

// 🏨 Book Hotel Room
app.post('/hotel-book', async (req, res) => {
  const { userId, hotelName, roomType, date } = req.body;
  try {
    const room = await HotelRoomModel.findOne({ hotelName, roomType, available: true });
    if (!room) {
      return res.status(404).json({ error: "Room not available" });
    }

    const booking = await HotelBookingModel.create({
      userId,
      hotelName,
      roomType,
      price: room.price,
      date
    });

    await HotelRoomModel.findByIdAndUpdate(room._id, { available: false });

    await addPoints(userId, 'hotel');

    res.json({ message: "Booking successful", booking });
  } catch (err) {
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

app.delete('/cancel-hotel-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find and delete the booking
    const booking = await HotelBookingModel.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Make the room available again
    await HotelRoomModel.findOneAndUpdate(
      { hotelName: booking.hotelName, roomType: booking.roomType },
      { available: true }
    );

    res.json({ message: "Hotel booking cancelled, room is now available" });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed", details: err.message });
  }
});


// 💰 Get available rooms (with price filter)
app.get('/hotel-rooms', async (req, res) => {
  const maxPrice = req.query.maxPrice;
  const filter = maxPrice
    ? { available: true, price: { $lte: maxPrice } }
    : { available: true };

  try {
    const rooms = await HotelRoomModel.find(filter);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hotel rooms", details: err.message });
  }
});

const Reservation = require('./models/ParkingReservation');
const ParkingSpot = require('./models/ParkingSpot');

app.get('/parking-spots', async (req, res) => {
  try {
    const spots = await ParkingSpot.find();
    res.status(200).json(spots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching spots' });
  }
});

app.post('/parking-reservation', async (req, res) => {
  try {
    const {
      userId, // Add userId in the request body
      selectedSpotId,
      fullName,
      vehicleType,
      licensePlate,
      reservationDate,
      startTime,
      endTime
    } = req.body;

    // Ensure userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const selectedSpot = await ParkingSpot.findOne({ _id: selectedSpotId, isAvailable: true });

    if (!selectedSpot) {
      return res.status(404).json({ message: 'Selected parking spot is unavailable or does not exist' });
    }

    const conflict = await Reservation.findOne({
      spot: selectedSpot._id,
      reservationDate,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (conflict) {
      return res.status(409).json({ message: 'Spot already reserved in this time slot' });
    }

    // Step 3: Create reservation with userId
    const reservation = new Reservation({
      spot: selectedSpot._id,
      fullName,
      vehicleType,
      licensePlate,
      reservationDate,
      startTime,
      endTime,
      userId // Add userId to the reservation document
    });

    await reservation.save();

    // Update parking spot availability
    await ParkingSpot.findByIdAndUpdate(selectedSpot._id, { isAvailable: false });

    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.delete('/cancel-parking-reservation/:reservationId', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await Reservation.findByIdAndDelete(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Mark the parking spot as available again
    await ParkingSpot.findByIdAndUpdate(reservation.spot, { isAvailable: true });

    res.json({ message: 'Parking reservation cancelled and spot is now available' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel reservation', error: err.message });
  }
});


const LoungeModel = require('./models/Lounge');
const LoungeBookingModel = require('./models/LoungeBooking');

app.post('/book-lounge', async (req, res) => {
  const { userId, loungeId, date, time } = req.body;

  try {
    const lounge = await LoungeModel.findById(loungeId);

    if (!lounge || !lounge.available) {
      return res.status(404).json({ error: "Lounge not available" });
    }

    if (lounge.bookedCount >= lounge.capacity) {
      return res.status(400).json({ error: "Lounge is fully booked" });
    }

    const booking = await LoungeBookingModel.create({
      userId,
      loungeId,
      date,
      time
    });

    // Increment bookedCount
    const newBookedCount = lounge.bookedCount + 1;
const isNowFull = newBookedCount >= lounge.capacity;

await LoungeModel.findByIdAndUpdate(loungeId, {
  bookedCount: newBookedCount,
  available: !isNowFull
});

await addPoints(userId, 'lounge');

    res.json({ message: "Lounge booked successfully", booking });
  } catch (err) {
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

app.delete('/cancel-lounge-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await LoungeBookingModel.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const lounge = await LoungeModel.findById(booking.loungeId);
    if (lounge) {
      const updatedCount = lounge.bookedCount - 1;
      const isNowAvailable = updatedCount < lounge.capacity;

await LoungeModel.findByIdAndUpdate(lounge._id, {
  bookedCount: updatedCount,
  available: isNowAvailable
});

    }

    res.json({ message: "Lounge booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed", details: err.message });
  }
});


app.get('/lounges', async (req, res) => {
  try {
    const lounges = await LoungeModel.find({ available: true });
    res.json(lounges);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lounges", details: err.message });
  }
});

const FlightModel = require('./models/Flight');
const FlightBookingModel = require('./models/FlightBooking');

// Get all available flights with filters
app.get('/flights', async (req, res) => {
  const { from, to, date, flightClass, maxPrice, luggageWeight, flightNumber } = req.query;

  const filter = {
    available: true,
    ...(from && { from }),
    ...(to && { to }),
    ...(date && { date }), // Optional exact match
    ...(flightClass && { flightClass }),
    ...(maxPrice && { price: { $lte: Number(maxPrice) } }),
    ...(luggageWeight && { maxLuggageWeight: { $gte: Number(luggageWeight) } }),
    ...(flightNumber && { flightNumber: { $regex: flightNumber, $options: 'i' } }) // ✨ partial match, case-insensitive
  };

  try {
    const flights = await FlightModel.find(filter);
    if (flights.length === 0) {
      return res.json({ message: "No flights match the criteria" });
    }
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flights", details: err.message });
  }
});


// Book a flight
app.post('/book-flight', async (req, res) => {
  const { userId, flightId, luggageWeight, seatNumber } = req.body;
  try {
    const flight = await FlightModel.findById(flightId);

    if (!flight || !flight.available || flight.seatsAvailable < 1) {
      return res.status(404).json({ error: "Flight not available" });
    }

    if (luggageWeight > flight.maxLuggageWeight) {
      return res.status(400).json({ error: "Luggage exceeds allowed weight" });
    }

    // Check if seat is already booked for this flight
const existingSeat = await FlightBookingModel.findOne({ 
  flightId, 
  seatNumber 
});

if (existingSeat) {
  return res.status(400).json({ error: "This seat is already booked. Please choose another one." });
}


    const booking = await FlightBookingModel.create({
      userId,
      flightId,
      luggageWeight,
      seatNumber   // ✨ save seat number
    });
    

    flight.seatsAvailable -= 1;
    if (flight.seatsAvailable === 0) flight.available = false;
    await flight.save();

    await addPoints(userId, 'flight');

    res.json({ message: "Flight booked successfully", booking });
  } catch (err) {
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

app.delete('/cancel-flight-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await FlightBookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const flightId = booking.flightId;

    // Delete booking
    await FlightBookingModel.findByIdAndDelete(bookingId);

    // Increment available seats on the flight
    await FlightModel.findByIdAndUpdate(flightId, {
      $inc: { seatsAvailable: 1 }
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed", details: err.message });
  }
});

app.post('/reschedule-flight', async (req, res) => {
  const { bookingId, newDate, newTime, newFlightClass, luggageWeight, seatNumber } = req.body;

  if (!seatNumber) {
    return res.status(400).json({ error: "New seat number is required for rescheduling" });
  }

  try {
    // Find the existing booking
    const booking = await FlightBookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Find the current flight associated with the booking
    const oldFlight = await FlightModel.findById(booking.flightId);
    if (!oldFlight) {
      return res.status(404).json({ error: "Old flight not found" });
    }

    // Find a new flight with the same source and destination
    const newFlight = await FlightModel.findOne({
      from: oldFlight.from,
      to: oldFlight.to,
      date: newDate,
      time: newTime,
      flightClass: newFlightClass,
      available: true,
      seatsAvailable: { $gte: 1 }
    });

    if (!newFlight) {
      return res.status(404).json({ error: "No matching flight available for rescheduling" });
    }

    // Check if the new luggage weight exceeds the new flight's max limit
    if (luggageWeight > newFlight.maxLuggageWeight) {
      return res.status(400).json({ error: `Luggage exceeds the allowed weight of ${newFlight.maxLuggageWeight}kg for the new flight` });
    }

    // ✅ Check if seat is already booked on the new flight
    const seatTaken = await FlightBookingModel.findOne({
      flightId: newFlight._id,
      seatNumber
    });

    if (seatTaken) {
      return res.status(400).json({ error: "This seat is already taken on the new flight. Please select another one." });
    }

    // Restore seat on old flight
    oldFlight.seatsAvailable += 1;
    oldFlight.available = oldFlight.seatsAvailable > 0;
    await oldFlight.save();

    // Reduce seat on new flight
    newFlight.seatsAvailable -= 1;
    newFlight.available = newFlight.seatsAvailable > 0;
    await newFlight.save();

    // Update booking
    booking.flightId = newFlight._id;
    booking.luggageWeight = luggageWeight;
    booking.seatNumber = seatNumber; // ✅ force new seat
    await booking.save();

    res.json({ message: "Flight rescheduled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: "Rescheduling failed", details: err.message });
  }
});


app.get('/booked-flights', async (req, res) => {
  try {
    // Find all bookings, populating the flight information (flightId references Flight model)
    const bookings = await FlightBookingModel.find()
      .populate('flightId', 'flightNumber airline from to date time arrivalTime flightClass price seatsAvailable available seatNumber')
      .exec();

    if (bookings.length === 0) {
      return res.json({ message: 'No bookings found.' });
    }

    // Return all booked flights along with flight details
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booked flights', details: err.message });
  }
});

const { convertCurrency } = require('./services/currencyConverter');

// Currency conversion route
app.post('/convert-currency', async (req, res) => {
  const { amount, fromCurrency, toCurrency } = req.body;

  try {
      if (!amount || !fromCurrency || !toCurrency) {
          return res.status(400).json({ error: 'Please provide amount, fromCurrency, and toCurrency' });
      }

      if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
          return res.status(400).json({ error: 'From and To currencies must be different' });
      }

      const { rate, convertedAmount } = await convertCurrency(amount, fromCurrency.toUpperCase(), toCurrency.toUpperCase());

      res.json({
          amount,
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          rate,
          convertedAmount
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

const { trackLuggage } = require('./services/luggageTracking');
app.post('/track-luggage', async (req, res) => {
  const { flightNumber, luggageId } = req.body;

  try {
      if (!flightNumber || !luggageId) {
          return res.status(400).json({ error: 'Please provide flightNumber and luggageId' });
      }

      const status = await trackLuggage(flightNumber, luggageId);

      res.json({
          flightNumber: flightNumber.toUpperCase(),
          luggageId: luggageId.toUpperCase(),
          status
      });
  } catch (error) {
      res.status(404).json({ error: error.message });
  }
});

const { redeemPoints } = require('./services/RewardsService');

app.post('/redeem-points', async (req, res) => {
  const { userId, points } = req.body;
  try {
    const remaining = await redeemPoints(userId, points);
    res.json({ message: "Points redeemed", remainingPoints: remaining });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/user-rewards/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ rewards: user.rewards });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Flight status API
app.get('/flight-status/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  
  try {
    const flight = await FlightModel.findOne({ flightNumber });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Simulated or static status (replace this with real-time logic if available)
    const flightStatus = getFlightStatus(flightNumber); // Example function you define

    res.json({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      departure: {
        location: flight.from,
        time: flight.time
      },
      destination: {
        location: flight.to,
        time: flight.arrivalTime
      },
      status: flightStatus
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flight status', details: err.message });
  }
});


// Helper function to simulate or fetch flight status
const getFlightStatus = (flightNumber) => {
  // Simulate the status for now or connect to external flight tracking services
  const statuses = ['Scheduled', 'Boarding', 'In Flight', 'Landed', 'Delayed', 'Cancelled', 'Taxiing'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const DutiesModel = require('./models/Duties');  // Correct the import

app.post('/assign-duty', async (req, res) => {
  const { taskName, staffName, date, time, taskDescription, frequency, location } = req.body;

  // Validate frequency
  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    return res.status(400).json({ error: "Invalid frequency value. It must be 'daily', 'weekly', or 'monthly'" });
  }

  try {
    const duty = new DutiesModel({
      taskName,
      staffName,
      date,
      time,
      taskDescription,
      assigned: true,
      frequency,  // Store frequency of the duty
      location    // Store location of the duty
    });

    await duty.save();

    res.json({ message: "Duty assigned successfully", duty });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign duty", details: err.message });
  }
});

app.get('/duties', async (req, res) => {
  const { staffName, frequency, location } = req.query;

  const filter = {
    ...(staffName && { staffName }),
    ...(frequency && { frequency }),
    ...(location && { location })
  };

  try {
    const duties = await DutiesModel.find(filter);

    if (duties.length === 0) {
      return res.json({ message: "No duties found matching criteria" });
    }

    res.json(duties);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch duties", details: err.message });
  }
});

const HangarReservation = require('./models/HangarReservation'); 
const HangarSpot = require('./models/HangarSpot');

app.post('/hangar-reservation', async (req, res) => {
  try {
    const {
      userid,
      selectedHangarId,
      ownerName,
      reservationDate,
      startTime,
      endTime
    } = req.body;

    if (!userid) return res.status(400).json({ message: 'User ID is required' });

    const selectedHangar = await HangarSpot.findOne({
      _id: selectedHangarId,
      isAvailable: true
    });

    if (!selectedHangar) {
      return res.status(404).json({ message: 'Selected hangar is unavailable or does not exist' });
    }

    const conflict = await HangarReservation.findOne({
      spot: selectedHangar._id,
      reservationDate,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (conflict) {
      return res.status(409).json({ message: 'Hangar already reserved in this time slot' });
    }

    const reservation = new HangarReservation({
      userId: userid,
      spot: selectedHangar._id,
      ownerName,
      reservationDate,
      startTime,
      endTime
    });

    await reservation.save();

    await HangarSpot.findByIdAndUpdate(selectedHangar._id, { isAvailable: false });

    res.status(201).json({ message: 'Hangar reservation successful', reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


const Airplane = require('./models/Airplanes');

app.post('/add-airplane', async (req, res) => {
  const { userId, spotId, manufacturer, type, regNo } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });

  const hangar = await HangarSpot.findById(spotId);

  if (!hangar) {
    return res.status(404).json({ success: false, message: 'Hangar not found' });
  }

  if (hangar.currentOccupancy >= hangar.capacity) {
    return res.status(400).json({ success: false, message: 'Hangar is at full capacity' });
  }

  const airplane = new Airplane({
    userId,
    spot: spotId,
    manufacturer,
    type,
    regNo
  });

  await airplane.save();

  hangar.currentOccupancy += 1;
  await hangar.save();

  return res.status(201).json({
    success: true,
    message: "Airplane added successfully",
    airplane
  });
});


app.delete('/delete-hangar-reservation/:reservationId', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await HangarReservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const spotId = reservation.spot;

    // Delete all airplanes in that spot
    await Airplane.deleteMany({ spot: spotId });

    // Reset hangar
    await HangarSpot.findByIdAndUpdate(spotId, {
      isAvailable: true,
      currentOccupancy: 0
    });

    await HangarReservation.findByIdAndDelete(reservationId);

    return res.status(200).json({
      success: true,
      message: 'Hangar reservation and associated airplanes deleted. Hangar is now available.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


app.delete('/delete-airplane/:airplaneId', async (req, res) => {
  const { airplaneId } = req.params;

  try {
    const airplane = await Airplane.findById(airplaneId);
    if (!airplane) {
      return res.status(404).json({ success: false, message: 'Airplane not found' });
    }

    const spotId = airplane.spot;

    await Airplane.findByIdAndDelete(airplaneId);

    const hangar = await HangarSpot.findById(spotId);
    if (hangar && hangar.currentOccupancy > 0) {
      hangar.currentOccupancy -= 1;
      await hangar.save();
    }

    return res.status(200).json({
      success: true,
      message: "Airplane deleted and hangar occupancy updated."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.get('/passenger-details', async (req, res) => {
  const { date, flightNumber } = req.query;

  try {
    // Step 1: Build flight filter (partial if needed)
    const flightFilter = {};
    if (date) flightFilter.date = date;
    if (flightNumber) flightFilter.flightNumber = { $regex: flightNumber, $options: 'i' };

    // Step 2: Get matching flights
    const matchingFlights = await FlightModel.find(flightFilter);

    if (matchingFlights.length === 0) {
      return res.json({ message: "No matching flights found" });
    }

    const flightIds = matchingFlights.map(flight => flight._id);
    const flightMap = Object.fromEntries(matchingFlights.map(f => [f._id.toString(), f]));

    // Step 3: Find bookings for those flights
    const bookings = await FlightBookingModel.find({ flightId: { $in: flightIds } })
      .populate('userId', 'name') // only get name from User
      .lean();

    if (bookings.length === 0) {
      return res.json({ message: "No passengers found for the given criteria" });
    }

    // Step 4: Build response
    const passengerDetails = bookings.map(booking => {
      const flight = flightMap[booking.flightId.toString()];
      return {
        passengerName: booking.userId.name,
        departure: {
          location: flight.from,
          time: flight.time
        },
        arrival: {
          location: flight.to,
          time: flight.arrivalTime
        },
        seatNumber: booking.seatNumber
      };
    });

    res.json(passengerDetails);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch passenger details", details: err.message });
  }
});
