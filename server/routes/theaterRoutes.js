const express = require('express');
const router = express.Router();
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const { protect, admin } = require('../middleware/authMiddleware');

// --- THEATER ROUTES ---

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const theaters = await Theater.find({});
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a theater
// @route   POST /api/theaters
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, location, screens } = req.body;

    try {
        const theater = new Theater({
            name,
            location,
            screens,
        });

        const createdTheater = await theater.save();
        res.status(201).json(createdTheater);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a theater
// @route   PUT /api/theaters/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, location, screens } = req.body;

    try {
        const theater = await Theater.findById(req.params.id);

        if (theater) {
            theater.name = name || theater.name;
            theater.location = location || theater.location;
            theater.screens = screens || theater.screens;

            const updatedTheater = await theater.save();
            res.json(updatedTheater);
        } else {
            res.status(404).json({ message: 'Theater not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a theater
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (theater) {
            await theater.deleteOne();
            res.json({ message: 'Theater removed' });
        } else {
            res.status(404).json({ message: 'Theater not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- SHOWTIME ROUTES ---

// @desc    Get showtimes for a movie
// @route   GET /api/theaters/showtimes/:movieId
// @access  Public
router.get('/showtimes/:movieId', async (req, res) => {
    try {
        const showtimes = await Showtime.find({ movie: req.params.movieId })
            .populate('theater', 'name location')
            .sort({ startTime: 1 });
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a showtime
// @route   POST /api/theaters/showtimes
// @access  Private/Admin
router.post('/showtimes', protect, admin, async (req, res) => {
    const { movie, theater, screen, startTime, price } = req.body;

    try {
        // Find theater to get screen details (capacity)
        const theaterObj = await Theater.findById(theater);
        if (!theaterObj) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        const screenObj = theaterObj.screens.find(s => s.name === screen);
        if (!screenObj) {
            return res.status(404).json({ message: 'Screen not found in theater' });
        }

        // Generate seats based on capacity
        const seats = [];
        const rows = Math.ceil(screenObj.seats / 10); // Assume 10 seats per row
        const seatsPerRow = 10;

        for (let i = 0; i < rows; i++) {
            const rowLabel = String.fromCharCode(65 + i); // A, B, C...
            for (let j = 1; j <= seatsPerRow; j++) {
                if (seats.length < screenObj.seats) {
                    seats.push(`${rowLabel}${j}`); // Store as string "A1", "A2"
                }
            }
        }

        const showtime = new Showtime({
            movie,
            theater,
            screen,
            startTime,
            seats, // Available seats (all initially)
            price
        });

        const createdShowtime = await showtime.save();
        res.status(201).json(createdShowtime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a showtime
// @route   PUT /api/theaters/showtimes/:id
// @access  Private/Admin
router.put('/showtimes/:id', protect, admin, async (req, res) => {
    const { startTime, price } = req.body;

    try {
        const showtime = await Showtime.findById(req.params.id);

        if (showtime) {
            showtime.startTime = startTime || showtime.startTime;
            showtime.price = price || showtime.price;

            const updatedShowtime = await showtime.save();
            res.json(updatedShowtime);
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a showtime
// @route   DELETE /api/theaters/showtimes/:id
// @access  Private/Admin
router.delete('/showtimes/:id', protect, admin, async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);

        if (showtime) {
            await showtime.deleteOne();
            res.json({ message: 'Showtime removed' });
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single showtime
// @route   GET /api/theaters/showtime/:id
// @access  Public
router.get('/showtime/:id', async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate('movie', 'title poster')
            .populate('theater', 'name location');

        if (showtime) {
            res.json(showtime);
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
