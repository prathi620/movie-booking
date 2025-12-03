const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'Naveen2@gmail.com';
        const plainPassword = 'password123';

        // Update to plain text password using updateOne to bypass hooks
        await User.updateOne(
            { email: email },
            { $set: { password: plainPassword } },
            { upsert: true } // Create if not exists (though updateOne with upsert might not set other required fields if creating)
        );

        // If user didn't exist, we need to create it properly.
        const user = await User.findOne({ email });
        if (!user) {
            await User.create({
                name: 'Naveen',
                email: email,
                password: plainPassword,
                role: 'user'
            });
            // The hook will hash it, so we need to update it again to plain text if we want plain text
            await User.updateOne(
                { email: email },
                { $set: { password: plainPassword } }
            );
        }

        console.log(`Password for ${email} has been set to plain text: ${plainPassword}`);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword();
