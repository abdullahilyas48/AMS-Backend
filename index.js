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
      const isMatch = await bcrypt.compare(password, admin.password); 
      if (!isMatch) {
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
    const { email, newPassword } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const user = await UserModel.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
      if (user) {
        res.json({ Status: "Password updated successfully" });
      } else {
        res.json({ Status: "User not found" });
      }
    } catch (err) {
      res.json({ Status: "Error", Error: err });
    }
  });
  
  app.post('/reset-admin-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const admin = await AdminModel.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
      if (admin) {
        res.json({ Status: "Password updated successfully" });
      } else {
        res.json({ Status: "User not found" });
      }
    } catch (err) {
      res.json({ Status: "Error", Error: err });
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