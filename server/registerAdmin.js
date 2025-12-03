const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const registerAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@test.com';
        const password = 'password123';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('User already exists, updating role...');
            user.role = 'admin';
            user.password = password; // Reset password to be sure
            await user.save();
            console.log('User updated to admin');
        } else {
            console.log('Creating new admin user...');
            user = await User.create({
                name: 'Admin User',
                email,
                password,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

registerAdmin();
