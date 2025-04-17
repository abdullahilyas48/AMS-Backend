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

app.post('/login', (req,res) => {
    const {email, password} = req.body;
    UserModel.findOne({email: email})
    .then(user => {
        if(user){
            if(user.password === password) {
                res.json("Success!")
            } else {
                res.json("Wrong Password.")
            }
        } else {
            res.json("No Records Exist.")
        }
    })
    .catch(err => res.json(err))
})

app.post('/login', (req,res) => {
    const {email, password} = req.body;
    AdminModel.findOne({email: email})
    .then(user => {
        if(user){
            if(user.password === password) {
                res.json("Success!")
            } else {
                res.json("Wrong Password.")
            }
        } else {
            res.json("No Records Exist.")
        }
    })
    .catch(err => res.json(err))
})

app.post('/register', (req,res) => {
    UserModel.create(req.body).then(users => res.json(users)).catch(err=> res.json(err))
})