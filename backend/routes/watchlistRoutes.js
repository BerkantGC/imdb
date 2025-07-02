const express = require('express');
const router = express.Router();
const { check, param, body } = require('express-validator');
const watchlistController = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

// @route   GET /api/watchlist
// @desc    Get the user's watchlist
// @access  Private
router.get('/', protect, watchlistController.getWatchlist);

// @route   GET /api/watchlist/summary
// @desc    Get a summary of the user's watchlist for a dashboard
// @access  Private
router.get('/summary', protect, watchlistController.getWatchlistSummary);

// @route   GET /api/watchlist/stats
// @desc    Get statistics for the user's watchlist
// @access  Private
router.get('/stats', protect, watchlistController.getWatchlistStats);

// @route   GET /api/watchlist/recommendations
// @desc    Get movie recommendations based on the user's watchlist
// @access  Private
router.get('/recommendations', protect, watchlistController.getWatchlistRecommendations);

// @route   POST /api/watchlist/bulk
// @desc    Perform bulk operations on the watchlist (e.g., remove, change priority)
// @access  Private
router.post(
  '/bulk',
  protect,
  [
    body('action', 'Bulk action is required').isIn(['remove', 'set_priority', 'mark_watched', 'mark_unwatched']),
    body('movieIds', 'Movie IDs must be an array').isArray({ min: 1 }),
    body('movieIds.*', 'Invalid movie ID in array').isMongoId(),
    body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high'])
  ],
  watchlistController.bulkUpdateWatchlist
);

// @route   POST /api/watchlist/:movieId
// @desc    Add a movie to the watchlist
// @access  Private
router.post(
  '/:movieId',
  protect,
  [
    param('movieId', 'Invalid movie ID').isMongoId(),
    body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
    body('notes', 'Notes must be a string').optional().isString().trim().escape()
  ],
  watchlistController.addToWatchlist
);

// @route   DELETE /api/watchlist/:movieId
// @desc    Remove a movie from the watchlist
// @access  Private
router.delete(
  '/:movieId',
  protect,
  [param('movieId', 'Invalid movie ID').isMongoId()],
  watchlistController.removeFromWatchlist
);

// @route   PUT /api/watchlist/:movieId
// @desc    Update a movie entry in the watchlist (e.g., watched status, priority, notes)
// @access  Private
router.put(
  '/:movieId',
  protect,
  [
    param('movieId', 'Invalid movie ID').isMongoId(),
    body('isWatched', 'isWatched must be a boolean').optional().isBoolean(),
    body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
    body('notes', 'Notes must be a string').optional().isString().trim().escape()
  ],
  watchlistController.updateWatchlistEntry
);

// @route   GET /api/watchlist/:movieId/check
// @desc    Check if a movie is in the user's watchlist
// @access  Private
router.get(
  '/:movieId/check',
  protect,
  [param('movieId', 'Invalid movie ID').isMongoId()],
  watchlistController.isInWatchlist
);

module.exports = router; 