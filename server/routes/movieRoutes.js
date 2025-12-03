const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find({});
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { title, description, genre, duration, poster, releaseDate } = req.body;

    try {
        const movie = new Movie({
            title,
            description,
            genre,
            duration,
            poster,
            releaseDate,
        });

        const createdMovie = await movie.save();
        res.status(201).json(createdMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { title, description, genre, duration, poster, releaseDate } = req.body;

    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            movie.title = title || movie.title;
            movie.description = description || movie.description;
            movie.genre = genre || movie.genre;
            movie.duration = duration || movie.duration;
            movie.poster = poster || movie.poster;
            movie.releaseDate = releaseDate || movie.releaseDate;

            const updatedMovie = await movie.save();
            res.json(updatedMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            await movie.deleteOne();
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
