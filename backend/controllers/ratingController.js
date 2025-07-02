const ratingService = require('../services/ratingService');
const { validationResult } = require('express-validator');

// Asynchronous wrapper for route handlers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Add or update a rating for a movie
exports.rateMovie = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { movieId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    const result = await ratingService.rateMovie(userId, movieId, rating);
    if (result.success) {
      res.status(201).json(result);
    }
  } catch (error) {
    error.statusCode = error.message.includes('not found') ? 404 : 400;
    next(error);
  }
});

// Get user's rating for a movie
exports.getUserMovieRating = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user.id;
  
  const result = await ratingService.getUserMovieRating(userId, movieId);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Delete a user's rating for a movie
exports.deleteRating = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user.id;
  
  try {
    const result = await ratingService.deleteRating(userId, movieId);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Get all ratings by a user
exports.getUserRatings = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const result = await ratingService.getUserRatings(userId, req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get rating stats for a movie
exports.getMovieRatingStats = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  
  try {
    const result = await ratingService.getMovieRatingStats(movieId);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Get top rated movies
exports.getTopRatedMovies = asyncHandler(async (req, res, next) => {
  const result = await ratingService.getTopRatedMovies(req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get recent ratings (activity feed)
exports.getRecentRatings = asyncHandler(async (req, res, next) => {
  const result = await ratingService.getRecentRatings(req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get user's rating statistics
exports.getUserRatingStats = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  const result = await ratingService.getUserRatingStats(userId);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Compare user's rating with movie's average rating
exports.compareUserRating = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const result = await ratingService.compareUserRatings(userId, movieId);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = error.message.includes('not rated') ? 404 : 400;
    next(error);
  }
}); 