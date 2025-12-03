const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const result = await Movie.deleteMany({
            title: { $in: ['Inception', 'Interstellar'] }
        });

        console.log(`Deleted ${result.deletedCount} movies`);
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
