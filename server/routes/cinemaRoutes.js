const express = require('express');
const router = express.Router();
const { handleCinemaWebhook } = require('../services/cinemaService');

// @desc    Receive webhook updates from cinema database
// @route   POST /api/cinema/webhook
// @access  Public (but should be secured with API key in production)
router.post('/webhook', async (req, res) => {
    try {
        console.log('[CINEMA WEBHOOK] Received webhook from cinema database');

        // In production, verify webhook signature/API key here
        // const apiKey = req.headers['x-api-key'];
        // if (apiKey !== process.env.CINEMA_API_KEY) {
        //     return res.status(401).json({ message: 'Unauthorized' });
        // }

        await handleCinemaWebhook(req.body);

        res.status(200).json({
            message: 'Webhook processed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[CINEMA WEBHOOK] Error processing webhook:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
});

// @desc    Manually trigger cinema data sync
// @route   POST /api/cinema/sync
// @access  Private/Admin (should be protected)
router.post('/sync', async (req, res) => {
    try {
        console.log('[CINEMA API] Manual sync triggered');
        const { syncMovies } = require('../services/cinemaService');
        await syncMovies();

        res.status(200).json({
            message: 'Cinema data sync completed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[CINEMA API] Error during manual sync:', error);
        res.status(500).json({ message: 'Error syncing cinema data' });
    }
});

// @desc    Search movies on TMDB
// @route   GET /api/cinema/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const { searchMoviesOnTMDB } = require('../services/cinemaService');
        const results = await searchMoviesOnTMDB(query);
        res.json(results);
    } catch (error) {
        console.error('[CINEMA API] Error searching movies:', error);
        res.status(500).json({ message: 'Error searching movies' });
    }
});

// @desc    Import movie from TMDB
// @route   POST /api/cinema/import
// @access  Public (should be protected in prod)
router.post('/import', async (req, res) => {
    try {
        const { tmdbId } = req.body;
        if (!tmdbId) {
            return res.status(400).json({ message: 'TMDB ID is required' });
        }

        const { importMovieFromTMDB } = require('../services/cinemaService');
        const movie = await importMovieFromTMDB(tmdbId);

        // Generate showtimes for the new movie so it's bookable immediately
        // This is a quick hack to ensure showtimes exist
        // In a real app, admin would schedule it

        res.status(201).json(movie);
    } catch (error) {
        console.error('[CINEMA API] Error importing movie:', error);
        res.status(500).json({ message: 'Error importing movie' });
    }
});

module.exports = router;
