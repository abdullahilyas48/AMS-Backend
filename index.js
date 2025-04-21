const express = require("express")
const mongoose = require("mongoose")
const cors = require ('cors')
const UserModel = require('./models/User')
const AdminModel = require('./models/Admin')
const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/User")

app.listen(3001,()=>{
    
})

const bcrypt = require('bcrypt');
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
      res.json("Success!");
    } else {
      res.json("Wrong Password.");
    }
  } catch (err) {
    res.json(err);
  }
});


app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.json("No Records Exist.");
    }
    const isMatch = await bcrypt.compare(password, admin.password); 
    if (isMatch) {
      res.json("Success!");
    } else {
      res.json("Wrong Password.");
    }
  } catch (err) {
    res.json(err);
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
  