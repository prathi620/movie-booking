const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { protect } = require('../middleware/authMiddleware');
const { sendEmail } = require('../services/notificationService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
    const { showtime, seats, totalAmount, paymentMethod, paymentDetails } = req.body;

    try {
        const showtimeDoc = await Showtime.findById(showtime).populate('movie theater');

        if (!showtimeDoc) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Create booking with payment details
        const booking = new Booking({
            user: req.user._id,
            showtime: showtime,
            seats,
            totalAmount,
            paymentMethod,
            paymentDetails,
            status: 'confirmed'
        });

        const createdBooking = await booking.save();

        // Populate the booking before sending response
        const populatedBooking = await Booking.findById(createdBooking._id)
            .populate('user', 'name email')
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie theater',
                    select: 'title poster name location',
                },
            });

        res.status(201).json(populatedBooking);

        // Send confirmation email
        const emailSubject = `Booking Confirmation - ${populatedBooking.showtime.movie.title}`;
        const emailBody = `
            Dear ${req.user.name},
            
            Your booking for ${populatedBooking.showtime.movie.title} has been confirmed!
            
            Booking ID: ${populatedBooking._id}
            Theater: ${populatedBooking.showtime.theater.name}
            Time: ${new Date(populatedBooking.showtime.startTime).toLocaleString()}
            Seats: ${populatedBooking.seats.join(', ')}
            Total Amount: $${populatedBooking.totalAmount}
            
            Thank you for booking with us!
        `;
        await sendEmail(req.user.email, emailSubject, emailBody);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
router.get('/mybookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie theater',
                    select: 'title poster name location',
                },
            })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie theater',
                    select: 'title poster name location',
                },
            });

        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('showtime');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check user authorization
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if showtime is in the past
        const showtimeDate = new Date(booking.showtime.startTime);
        if (showtimeDate < new Date()) {
            return res.status(400).json({ message: 'Cannot cancel past bookings' });
        }

        // Release seats
        const showtime = await Showtime.findById(booking.showtime._id);
        if (showtime) {
            booking.seats.forEach(bookedSeat => {
                const seatIndex = showtime.seats.findIndex(
                    s => s.seatNumber === bookedSeat
                );
                if (seatIndex !== -1) {
                    showtime.seats[seatIndex].status = 'available';
                }
            });
            await showtime.save();
        }

        await booking.deleteOne();
        res.json({ message: 'Booking cancelled successfully' });

        // Send cancellation email
        const emailSubject = `Booking Cancelled - ${booking.showtime.movie.title}`;
        const emailBody = `
            Dear ${req.user.name},
            
            Your booking for ${booking.showtime.movie.title} has been cancelled.
            
            Booking ID: ${booking._id}
            
            We hope to see you again soon!
        `;
        await sendEmail(req.user.email, emailSubject, emailBody);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
