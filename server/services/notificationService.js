// Mock email service (logs to console)
const sendEmail = async (to, subject, text) => {
    console.log(`[EMAIL MOCK] To: ${to}`);
    console.log(`[EMAIL MOCK] Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Body: ${text}`);
    // In production, use nodemailer transport
    return Promise.resolve(true);
};

// Mock SMS service (logs to console)
const sendSMS = async (to, text) => {
    console.log(`[SMS MOCK] To: ${to}`);
    console.log(`[SMS MOCK] Message: ${text}`);
    return Promise.resolve(true);
};

// Schedule reminders (Mock implementation)
// In production, use node-cron
const scheduleReminders = () => {
    console.log('[SCHEDULER] Reminder service started...');
    setInterval(async () => {
        // Logic to check DB for upcoming showtimes in next 1 hour
        // const upcomingBookings = await Booking.find(...);
        // upcomingBookings.forEach(booking => sendEmail(...));
        // console.log('[SCHEDULER] Checked for upcoming showtimes');
    }, 60000 * 60); // Check every hour
};

module.exports = {
    sendEmail,
    sendSMS,
    scheduleReminders
};
