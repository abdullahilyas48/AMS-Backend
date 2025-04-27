const axios = require('axios');

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    const API_URL = `https://v6.exchangerate-api.com/v6/74a3d324f872abfb0c08035b/latest/${fromCurrency}`;

    try {
        const response = await axios.get(API_URL);
        const rates = response.data.conversion_rates;
        
        if (!rates[toCurrency]) {
            throw new Error('Invalid target currency');
        }

        const rate = rates[toCurrency];
        const convertedAmount = amount * rate;

        return {
            rate,
            convertedAmount
        };
    } catch (error) {
        console.error('Currency conversion error:', error.message);
        throw error;
    }
};

module.exports = {
    convertCurrency
};
