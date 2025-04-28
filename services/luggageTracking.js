const Luggage = require('../models/Luggage');

const trackLuggage = async (flightNumber, luggageId) => {
    const luggage = await Luggage.findOne({
        flightNumber: flightNumber.toUpperCase(),
        luggageId: luggageId.toUpperCase()
    });

    if (!luggage) {
        throw new Error('Luggage not found for given flight number and ID');
    }

    return luggage.status;
};

module.exports = {
    trackLuggage
};
