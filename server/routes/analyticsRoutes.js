const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get dashboard overview stats
// @route   GET /api/analytics/overview
// @access  Private/Admin
router.get('/overview', protect, admin, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalMovies = await Movie.countDocuments();

        res.json({
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalUsers,
            totalMovies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get booking trends (last 7 days)
// @route   GET /api/analytics/booking-trends
// @access  Private/Admin
router.get('/booking-trends', protect, admin, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const bookings = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get popular movies (by booking count)
// @route   GET /api/analytics/popular-movies
// @access  Private/Admin
router.get('/popular-movies', protect, admin, async (req, res) => {
    try {
        const popularMovies = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            {
                $lookup: {
                    from: 'showtimes',
                    localField: 'showtime',
                    foreignField: '_id',
                    as: 'showtimeData'
                }
            },
            { $unwind: '$showtimeData' },
            {
                $group: {
                    _id: '$showtimeData.movie',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    totalSeats: { $sum: { $size: '$seats' } }
                }
            },
            {
                $lookup: {
                    from: 'movies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'movieData'
                }
            },
            { $unwind: '$movieData' },
            {
                $project: {
                    title: '$movieData.title',
                    poster: '$movieData.poster',
                    genre: '$movieData.genre',
                    bookingCount: 1,
                    totalRevenue: 1,
                    totalSeats: 1
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 10 }
        ]);

        res.json(popularMovies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get theater occupancy rates
// @route   GET /api/analytics/theater-occupancy
// @access  Private/Admin
router.get('/theater-occupancy', protect, admin, async (req, res) => {
    try {
        const occupancy = await Showtime.aggregate([
            {
                $lookup: {
                    from: 'theaters',
                    localField: 'theater',
                    foreignField: '_id',
                    as: 'theaterData'
                }
            },
            { $unwind: '$theaterData' },
            {
                $project: {
                    theaterName: '$theaterData.name',
                    totalSeats: { $size: '$seats' },
                    bookedSeats: {
                        $size: {
                            $filter: {
                                input: '$seats',
                                as: 'seat',
                                cond: { $eq: ['$$seat.status', 'booked'] }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$theaterName',
                    totalCapacity: { $sum: '$totalSeats' },
                    totalBooked: { $sum: '$bookedSeats' }
                }
            },
            {
                $project: {
                    theater: '$_id',
                    totalCapacity: 1,
                    totalBooked: 1,
                    occupancyRate: {
                        $multiply: [
                            { $divide: ['$totalBooked', '$totalCapacity'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { occupancyRate: -1 } }
        ]);

        res.json(occupancy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get sales performance by month
// @route   GET /api/analytics/monthly-sales
// @access  Private/Admin
router.get('/monthly-sales', protect, admin, async (req, res) => {
    try {
        const monthlySales = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json(monthlySales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user activity stats
// @route   GET /api/analytics/user-activity
// @access  Private/Admin
router.get('/user-activity', protect, admin, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
            role: 'user'
        });

        const activeUsers = await Booking.distinct('user', {
            createdAt: { $gte: thirtyDaysAgo }
        });

        const topUsers = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            {
                $group: {
                    _id: '$user',
                    bookingCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            { $unwind: '$userData' },
            {
                $project: {
                    name: '$userData.name',
                    email: '$userData.email',
                    bookingCount: 1,
                    totalSpent: 1
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            newUsers,
            activeUsers: activeUsers.length,
            topUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get booking patterns (by day of week and time)
// @route   GET /api/analytics/booking-patterns
// @access  Private/Admin
router.get('/booking-patterns', protect, admin, async (req, res) => {
    try {
        const patterns = await Booking.aggregate([
            {
                $lookup: {
                    from: 'showtimes',
                    localField: 'showtime',
                    foreignField: '_id',
                    as: 'showtimeData'
                }
            },
            { $unwind: '$showtimeData' },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$showtimeData.startTime' },
                        hour: { $hour: '$showtimeData.startTime' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedPatterns = patterns.map(p => ({
            day: dayNames[p._id.dayOfWeek - 1],
            hour: p._id.hour,
            timeSlot: `${p._id.hour}:00 - ${p._id.hour + 1}:00`,
            bookings: p.count
        }));

        res.json(formattedPatterns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
