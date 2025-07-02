const watchlistService = require('../services/watchlistService');
const { validationResult } = require('express-validator');

// Asynchronous wrapper for route handlers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Add movie to watchlist
exports.addToWatchlist = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { movieId } = req.params;
  const userId = req.user.id;
  const options = req.body;

  try {
    const result = await watchlistService.addToWatchlist(userId, movieId, options);
    if (result.success) {
      res.status(201).json(result);
    }
  } catch (error) {
    error.statusCode = error.message.includes('not found') ? 404 : 400;
    next(error);
  }
});

// Remove movie from watchlist
exports.removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const result = await watchlistService.removeFromWatchlist(userId, movieId);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Get user's watchlist
exports.getWatchlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const result = await watchlistService.getUserWatchlist(userId, req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Update watchlist item (mark as watched/unwatched, priority, notes)
exports.updateWatchlistEntry = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { movieId } = req.params;
  const userId = req.user.id;
  const { isWatched, priority, notes } = req.body;

  try {
    if (typeof isWatched !== 'undefined') {
      const result = await watchlistService.markAsWatched(userId, movieId, isWatched);
      if (result.success) {
        return res.status(200).json(result);
      }
    } else {
      const result = await watchlistService.updateWatchlistEntry(userId, movieId, { priority, notes });
      if (result.success) {
        return res.status(200).json(result);
      }
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Check if a movie is in user's watchlist
exports.isInWatchlist = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user.id;
  
  const result = await watchlistService.isInWatchlist(userId, movieId);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get user's watchlist statistics
exports.getWatchlistStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const result = await watchlistService.getWatchlistStats(userId);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get watchlist recommendations
exports.getWatchlistRecommendations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const result = await watchlistService.getWatchlistRecommendations(userId, req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get watchlist summary (dashboard)
exports.getWatchlistSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const result = await watchlistService.getWatchlistSummary(userId);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Bulk update watchlist
exports.bulkUpdateWatchlist = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { action, movieIds, priority, isWatched } = req.body;

  try {
    let result;
    switch(action) {
      case 'set_priority':
        result = await watchlistService.bulkUpdatePriority(userId, movieIds, priority);
        break;
      case 'mark_watched':
        result = await watchlistService.bulkMarkAsWatched(userId, movieIds, true);
        break;
      case 'mark_unwatched':
        result = await watchlistService.bulkMarkAsWatched(userId, movieIds, false);
        break;
      case 'remove':
        result = await watchlistService.bulkRemoveFromWatchlist(userId, movieIds);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }

    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
}); 