const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const movieRoutes = require('./movieRoutes');
const ratingRoutes = require('./ratingRoutes');
const commentRoutes = require('./commentRoutes');
const watchlistRoutes = require('./watchlistRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
// Use a base route for ratings not directly tied to a movie
router.use('/ratings', ratingRoutes);
// Nest rating routes under movies as well for RESTful consistency
router.use('/movies', ratingRoutes);
router.use('/comments', commentRoutes);
// Nest comment routes under movies as well
router.use('/movies', commentRoutes);
router.use('/watchlist', watchlistRoutes);


module.exports = router; 