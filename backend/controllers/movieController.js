const movieService = require('../services/movieService');
const { validationResult } = require('express-validator');

// Asynchronous wrapper for route handlers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all movies
exports.getMovies = asyncHandler(async (req, res, next) => {
  const result = await movieService.getMovies(req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Search movies
exports.searchMovies = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }
  const result = await movieService.searchMovies(q, req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Autocomplete movie search
exports.autocompleteSearch = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }
  const result = await movieService.autocompleteSearch(q);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get top N movies by popularity
exports.getTopMovies = asyncHandler(async (req, res, next) => {
  const limit = req.query.limit || 10;
  const result = await movieService.getTopMoviesByPopularity(limit);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get single movie by ID
exports.getMovieById = asyncHandler(async (req, res, next) => {
  try {
    const result = await movieService.getMovieById(req.params.id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Create new movie (Admin only)
exports.createMovie = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const movieData = req.body;
  if (req.file) {
    movieData.imageUrl = req.file.path;
  }

  try {
    const result = await movieService.createMovie(movieData);
    if (result.success) {
      res.status(201).json(result);
    }
  } catch (error) {
    next(error);
  }
});

// Update movie (Admin only)
exports.updateMovie = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const updateData = req.body;
  if (req.file) {
    updateData.imageUrl = req.file.path;
  }

  try {
    const result = await movieService.updateMovie(req.params.id, updateData);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Delete movie (Admin only)
exports.deleteMovie = asyncHandler(async (req, res, next) => {
  try {
    const result = await movieService.deleteMovie(req.params.id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Get movie statistics
exports.getMovieStats = asyncHandler(async (req, res, next) => {
  try {
    const result = await movieService.getMovieStats(req.params.id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Get trending movies
exports.getTrendingMovies = asyncHandler(async (req, res, next) => {
  const { days = 7, limit = 10 } = req.query;
  const result = await movieService.getTrendingMovies(days, limit);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Force update of all popularity scores (Admin only)
exports.updateAllPopularityScores = asyncHandler(async (req, res, next) => {
  try {
    const result = await movieService.updateAllPopularityScores();
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
});

// Get movies by genre
exports.getMoviesByGenre = asyncHandler(async (req, res, next) => {
  req.query.genre = req.params.genre;
  const result = await movieService.getMovies(req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get movies by release year
exports.getMoviesByYear = asyncHandler(async (req, res, next) => {
  req.query.releaseYear = req.params.year;
  const result = await movieService.getMovies(req.query);
  if (result.success) {
    res.status(200).json(result);
  }
}); 