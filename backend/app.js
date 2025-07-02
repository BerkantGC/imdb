require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { setupRequestLogger } = require('./middleware/requestLogger');
const { setupHealthCheck } = require('./middleware/healthCheck');
const allRoutes = require('./routes');

// Initialize database connection
connectDB();

// Initialize Express application
const app = express();

// --- Core Middleware ---
app.use(compression()); // Compress responses
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
})); // Set security HTTP headers with CSP

// Configure CORS with more detailed options
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));

// --- Logging Middleware ---
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  setupRequestLogger(app); // Use custom request logger for production
}

// --- API Middleware ---
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies

// --- Authentication Middleware ---
app.use(passport.initialize());
require('./config/passport'); // Configure Passport strategies

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// --- Health Checks ---
setupHealthCheck(app);

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api', allRoutes);

// --- Error Handling ---
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Centralized error handler

// --- Server ---
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app; 