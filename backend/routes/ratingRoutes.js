const express = require('express');
const router = express.Router();
const { check, param } = require('express-validator');
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

// Note: Most rating routes are nested under movies for RESTful consistency.
// e.g., POST /api/movies/:movieId/rate

// @route   POST /api/movies/:movieId/rate
// @desc    Add or update a rating for a movie
// @access  Private
router.post(
  '/movies/:movieId/rate',
  protect,
  [
    param('movieId', 'Invalid movie ID').isMongoId(),
    check('rating', 'Rating must be an integer between 1 and 10').isInt({ min: 1, max: 10 })
  ],
  ratingController.rateMovie
);

// @route   GET /api/movies/:movieId/my-rating
// @desc    Get the current user's rating for a specific movie
// @access  Private
router.get(
  '/movies/:movieId/my-rating',
  protect,
  [param('movieId', 'Invalid movie ID').isMongoId()],
  ratingController.getUserMovieRating
);

// @route   DELETE /api/movies/:movieId/rate
// @desc    Delete the current user's rating for a movie
// @access  Private
router.delete(
  '/movies/:movieId/rate',
  protect,
  [param('movieId', 'Invalid movie ID').isMongoId()],
  ratingController.deleteRating
);

// @route   GET /api/ratings/mine
// @desc    Get all ratings submitted by the current user
// @access  Private
router.get('/mine', protect, ratingController.getUserRatings);

// @route   GET /api/movies/:movieId/ratings
// @desc    Get rating statistics for a movie
// @access  Public
router.get(
  '/movies/:movieId/ratings',
  [param('movieId', 'Invalid movie ID').isMongoId()],
  ratingController.getMovieRatingStats
);

// @route   GET /api/ratings/top-rated
// @desc    Get top rated movies
// @access  Public
router.get('/top-rated', ratingController.getTopRatedMovies);

// @route   GET /api/ratings/recent
// @desc    Get recent rating activity
// @access  Public
router.get('/recent', ratingController.getRecentRatings);

// @route   GET /api/ratings/stats/me
// @desc    Get rating stats for the current user
// @access  Private
router.get('/stats/me', protect, ratingController.getUserRatingStats);

// @route   GET /api/ratings/stats/user/:userId
// @desc    Get rating stats for a specific user
// @access  Public
router.get(
  '/stats/user/:userId',
  [param('userId', 'Invalid user ID').isMongoId()],
  ratingController.getUserRatingStats
);

// @route   GET /api/movies/:movieId/compare-rating
// @desc    Compare user's rating with movie's average
// @access  Private
router.get(
  '/movies/:movieId/compare-rating',
  protect,
  [param('movieId', 'Invalid movie ID').isMongoId()],
  ratingController.compareUserRating
);

module.exports = router; 