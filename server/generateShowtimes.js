const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Showtime = require('./models/Showtime');
require('dotenv').config();

const generateShowtimes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all movies and theaters
        const movies = await Movie.find();
        const theaters = await Theater.find();

        if (movies.length === 0) {
            console.log('No movies found. Please sync movies first.');
            return;
        }

        if (theaters.length === 0) {
            console.log('No theaters found. Creating default theaters...');
            const defaultTheaters = [
                { name: 'PVR Cinemas', location: 'Chennai', screens: [{ name: 'Screen 1', capacity: 100 }, { name: 'Screen 2', capacity: 120 }] },
                { name: 'Sathyam Cinemas', location: 'Chennai', screens: [{ name: 'Sathyam', capacity: 200 }, { name: 'Seasons', capacity: 150 }] },
                { name: 'IMAX', location: 'Chennai', screens: [{ name: 'IMAX Screen', capacity: 250 }] }
            ];
            await Theater.insertMany(defaultTheaters);
            console.log('Created default theaters.');
        }

        const allTheaters = await Theater.find();

        // Clear existing showtimes to avoid duplicates
        await Showtime.deleteMany({});
        console.log('Cleared existing showtimes.');

        const today = new Date();
        const showtimes = [];

        // Generate showtimes for the next 5 days
        for (let i = 0; i < 5; i++) {
            const baseDate = new Date(today);
            baseDate.setDate(today.getDate() + i);
            baseDate.setHours(0, 0, 0, 0);

            for (const movie of movies) {
                // Assign each movie to ALL theaters to ensure availability
                const selectedTheaters = allTheaters;

                for (const theater of selectedTheaters) {
                    const screen = theater.screens[0]; // Use first screen

                    // Generate seats
                    const seats = [];
                    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                    const seatsPerRow = 10;

                    for (let r = 0; r < rows.length; r++) {
                        for (let s = 1; s <= seatsPerRow; s++) {
                            if (seats.length >= screen.capacity) break;
                            seats.push({
                                row: rows[r],
                                number: s,
                                isBooked: false,
                                price: 150
                            });
                        }
                    }

                    // 4 Shows per day: 10 AM, 2 PM, 6 PM, 10 PM
                    const showTimes = [10, 14, 18, 22];

                    for (const hour of showTimes) {
                        const showTimeDate = new Date(baseDate);
                        showTimeDate.setHours(hour, 0, 0, 0);

                        showtimes.push({
                            movie: movie._id,
                            theater: theater._id,
                            screen: screen.name,
                            startTime: showTimeDate,
                            seats: [...seats] // Clone seats array
                        });
                    }
                }
            }
        }

        await Showtime.insertMany(showtimes);
        console.log(`Successfully generated ${showtimes.length} showtimes for ${movies.length} movies.`);

    } catch (error) {
        console.error('Error generating showtimes:', error);
    } finally {
        mongoose.connection.close();
    }
};

generateShowtimes();
