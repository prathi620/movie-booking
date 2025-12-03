const mongoose = require('mongoose');
const Showtime = require('./models/Showtime');
require('dotenv').config();

const checkShowtimes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Showtime.countDocuments();
        console.log(`Total Showtimes: ${count}`);
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkShowtimes();
