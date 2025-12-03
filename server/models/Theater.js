const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    screens: [{
        name: String,
        seats: Number,
    }],
}, { timestamps: true });

const Theater = mongoose.model('Theater', theaterSchema);

module.exports = Theater;
