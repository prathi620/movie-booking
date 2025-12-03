const express = require('express'); 
const dotenv = require('dotenv');
dotenv.config(); // Load env vars immediately
const cors = require('cors');
const mongoose = require('mongoose');
const { syncMovies, startRealTimeSync } = require('./services/cinemaService');
const { scheduleReminders } = require('./services/notificationService');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',               // local dev frontend
  'https://client-nu-inky.vercel.app'   // deployed frontend
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser requests like Postman
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
try {
    const authRoutes = require('./routes/authRoutes');
    const movieRoutes = require('./routes/movieRoutes');
    const theaterRoutes = require('./routes/theaterRoutes');
    const bookingRoutes = require('./routes/bookingRoutes');
    const cinemaRoutes = require('./routes/cinemaRoutes');
    const profileRoutes = require('./routes/profileRoutes');
    const analyticsRoutes = require('./routes/analyticsRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/movies', movieRoutes);
    app.use('/api/theaters', theaterRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/cinema', cinemaRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/analytics', analyticsRoutes);

    console.log('Routes loaded successfully');
} catch (error) {
    console.error('Error loading routes:', error);
}

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        scheduleReminders();
        startRealTimeSync(); // Start real-time cinema data sync (includes initial sync)
    })
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
