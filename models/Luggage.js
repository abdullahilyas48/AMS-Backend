const mongoose = require('mongoose');

const luggageSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        uppercase: true
    },
    luggageId: {
        type: String,
        required: true,
        uppercase: true,
        unique: true // one luggage ID per item
    },
    status: {
        type: String,
        required: true,
        default: 'Checked In'
    }
}, { timestamps: true });

const Luggage = mongoose.model('luggages', luggageSchema);

module.exports = Luggage;
