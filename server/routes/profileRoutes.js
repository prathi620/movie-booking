const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('preferences.preferredTheaters', 'name location');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.profilePicture = req.body.profilePicture || user.profilePicture;

            if (req.body.address) {
                // Initialize address if it doesn't exist
                if (!user.address) {
                    user.address = {};
                }
                user.address.street = req.body.address.street || user.address.street;
                user.address.city = req.body.address.city || user.address.city;
                user.address.state = req.body.address.state || user.address.state;
                user.address.zipCode = req.body.address.zipCode || user.address.zipCode;
                user.address.country = req.body.address.country || user.address.country;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                dateOfBirth: updatedUser.dateOfBirth,
                address: updatedUser.address,
                profilePicture: updatedUser.profilePicture,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
});

// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Initialize preferences if it doesn't exist
            if (!user.preferences) {
                user.preferences = {};
            }

            // Update preferences fields
            if (req.body.favoriteGenres !== undefined) {
                user.preferences.favoriteGenres = req.body.favoriteGenres;
            }
            if (req.body.preferredTheaters !== undefined) {
                user.preferences.preferredTheaters = req.body.preferredTheaters;
            }
            if (req.body.emailNotifications !== undefined) {
                user.preferences.emailNotifications = req.body.emailNotifications;
            }
            if (req.body.smsNotifications !== undefined) {
                user.preferences.smsNotifications = req.body.smsNotifications;
            }
            if (req.body.language !== undefined) {
                user.preferences.language = req.body.language;
            }

            const updatedUser = await user.save();

            res.json({
                preferences: updatedUser.preferences
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating preferences:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
});

// @desc    Get user booking history
// @route   GET /api/profile/bookings
// @access  Private
router.get('/bookings', protect, async (req, res) => {
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

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Current password is incorrect' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
