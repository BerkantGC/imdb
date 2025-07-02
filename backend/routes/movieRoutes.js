const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const movieController = require('../controllers/movieController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { uploadMovieImage } = require('../middleware/upload');

// @route   GET /api/movies
// @desc    Get all movies with filtering and pagination
// @access  Public
router.get('/', movieController.getMovies);

// @route   GET /api/movies/search
// @desc    Search for movies
// @access  Public
router.get('/search', movieController.searchMovies);

// @route   GET /api/movies/autocomplete
// @desc    Get movie suggestions for autocomplete
// @access  Public
router.get('/autocomplete', movieController.autocompleteSearch);

// @route   GET /api/movies/top
// @desc    Get top N movies by popularity
// @access  Public
router.get('/top', movieController.getTopMovies);

// @route   GET /api/movies/trending
// @desc    Get trending movies
// @access  Public
router.get('/trending', movieController.getTrendingMovies);

// @route   GET /api/movies/genre/:genre
// @desc    Get movies by genre
// @access  Public
router.get('/genre/:genre', movieController.getMoviesByGenre);

// @route   GET /api/movies/year/:year
// @desc    Get movies by release year
// @access  Public
router.get('/year/:year', movieController.getMoviesByYear);

// @route   GET /api/movies/:id
// @desc    Get a single movie by ID
// @access  Public
router.get('/:id', optionalAuth, movieController.getMovieById);

// @route   GET /api/movies/:id/stats
// @desc    Get statistics for a single movie
// @access  Public
router.get('/:id/stats', movieController.getMovieStats);

// --- Admin Routes ---

// @route   POST /api/movies
// @desc    Create a new movie
// @access  Admin
router.post(
  '/',
  protect,
  adminOnly,
  uploadMovieImage,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('summary', 'Summary is required').not().isEmpty(),
    check('releaseYear', 'Invalid release year').optional().isInt({ min: 1888 }),
    check('duration', 'Invalid duration').optional().isInt({ min: 1 })
  ],
  movieController.createMovie
);

// @route   PUT /api/movies/:id
// @desc    Update a movie
// @access  Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  uploadMovieImage,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('summary', 'Summary is required').optional().not().isEmpty(),
    check('releaseYear', 'Invalid release year').optional().isInt({ min: 1888 }),
    check('duration', 'Invalid duration').optional().isInt({ min: 1 })
  ],
  movieController.updateMovie
);

// @route   DELETE /api/movies/:id
// @desc    Delete a movie (soft delete)
// @access  Admin
router.delete('/:id', protect, adminOnly, movieController.deleteMovie);

// @route   POST /api/movies/update-popularity
// @desc    Force update of all movie popularity scores
// @access  Admin
router.post('/update-popularity', protect, adminOnly, movieController.updateAllPopularityScores);

module.exports = router; 