const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    rewards: {
        type: Number,
        default: 50
      }
})

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel