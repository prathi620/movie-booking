const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true,
    },
    screen: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    seats: [{
        row: String,
        number: Number,
        isBooked: {
            type: Boolean,
            default: false,
        },
        price: Number,
    }],
}, { timestamps: true });

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;
