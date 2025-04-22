const express = require("express")
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose")
const cors = require ('cors')
const UserModel = require('./models/User')
const AdminModel = require('./models/Admin')
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
  
app.post('/register', async (req, res) => {
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
  const BookingModel = require('./models/Booking');
  
  // 📥 Create Booking
  app.post('/book', async (req, res) => {
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
  
      res.json({ message: "Booking successful", booking });
    } catch (err) {
      res.status(500).json({ error: "Booking failed", details: err });
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

    res.json({ message: "Booking successful", booking });
  } catch (err) {
    res.status(500).json({ error: "Booking failed", details: err.message });
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

const Reservation = require('./models/Reservation');
const ParkingSpot = require('./models/ParkingSpot');

app.get('/spots', async (req, res) => {
  try {
    const spots = await ParkingSpot.find();
    res.status(200).json(spots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching spots' });
  }
});

app.post('/parkings', async (req, res) => {
  try {
    const {
      selectedSpotId,
      fullName,
      vehicleType,
      licensePlate,
      reservationDate,
      startTime,
      endTime
    } = req.body;

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

    // Step 3: Create reservation
    const reservation = new Reservation({
      spot: selectedSpot._id,
      fullName,
      vehicleType,
      licensePlate,
      reservationDate,
      startTime,
      endTime
    });

    await reservation.save();

    await ParkingSpot.findByIdAndUpdate(selectedSpot._id, { isAvailable: false });

    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
