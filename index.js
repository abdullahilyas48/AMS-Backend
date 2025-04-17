const express = require("express")
const mongoose = require("mongoose")
const cors = require ('cors')
const UserModel = require('./models/User')
const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/User")

app.listen(3001,()=>{
    UserModel.create(req.body).then(users => res.json(users)).catch(err=> res.json(err))
})
app.post('/register', (req,res) => {

})