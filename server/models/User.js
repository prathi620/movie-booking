const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Profile Information
    phone: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    // User Preferences
    preferences: {
        favoriteGenres: [{
            type: String
        }],
        preferredTheaters: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Theater'
        }],
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    // Profile Picture
    profilePicture: {
        type: String,
        default: 'https://via.placeholder.com/150'
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return; 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
