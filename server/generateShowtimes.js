const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');

const generateShowtimes = async () => {
  try {
    console.log("🎬 Generating showtimes...");

    // Get all movies and theaters
    const movies = await Movie.find();
    let theaters = await Theater.find();

    console.log("Movies:", movies.length);
    console.log("Theaters:", theaters.length);

    if (movies.length === 0) {
      console.log('❌ No movies found. Skipping showtime generation.');
      return;
    }

    // Create default theaters if none
    if (theaters.length === 0) {
      console.log('No theaters found. Creating default theaters...');

      const defaultTheaters = [
        {
          name: 'PVR Cinemas',
          location: 'Chennai',
          screens: [
            { name: 'Screen 1', capacity: 100 },
            { name: 'Screen 2', capacity: 120 }
          ]
        },
        {
          name: 'Sathyam Cinemas',
          location: 'Chennai',
          screens: [
            { name: 'Sathyam', capacity: 200 },
            { name: 'Seasons', capacity: 150 }
          ]
        },
        {
          name: 'IMAX',
          location: 'Chennai',
          screens: [
            { name: 'IMAX Screen', capacity: 250 }
          ]
        }
      ];

      await Theater.insertMany(defaultTheaters);
      theaters = await Theater.find();
      console.log('✅ Default theaters created.');
    }

    // Clear old showtimes
    await Showtime.deleteMany({});
    console.log("🧹 Old showtimes cleared");

    const today = new Date();
    const showtimes = [];

    for (let i = 0; i < 5; i++) {
      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() + i);
      baseDate.setHours(0, 0, 0, 0);

      for (const movie of movies) {
        for (const theater of theaters) {

          if (!theater.screens || theater.screens.length === 0) continue;

          const screen = theater.screens[0];

          const seats = [];
          const rows = ['A','B','C','D','E','F','G','H','I','J'];
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

          const showTimes = [10, 14, 18, 22];

          for (const hour of showTimes) {
            const showTimeDate = new Date(baseDate);
            showTimeDate.setHours(hour, 0, 0, 0);

            showtimes.push({
              movie: movie._id,
              theater: theater._id,
              screen: screen.name,
              startTime: showTimeDate,
              seats: seats
            });
          }
        }
      }
    }

    if (showtimes.length > 0) {
      await Showtime.insertMany(showtimes);
      console.log(`✅ ${showtimes.length} showtimes generated successfully`);
    } else {
      console.log("❌ No showtimes generated");
    }

  } catch (error) {
    console.error("❌ Error generating showtimes:", error);
  }
};

module.exports = generateShowtimes;
