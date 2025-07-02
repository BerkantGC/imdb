const commentService = require('../services/commentService');
const { validationResult } = require('express-validator');

// Asynchronous wrapper for route handlers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Add a comment to a movie
exports.addComment = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { movieId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const result = await commentService.addComment(userId, movieId, content);
    if (result.success) {
      res.status(201).json(result);
    }
  } catch (error) {
    error.statusCode = 404; // Assuming movie not found
    next(error);
  }
});

// Get comments for a movie
exports.getMovieComments = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const result = await commentService.getMovieComments(movieId, req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get single comment by ID
exports.getCommentById = asyncHandler(async (req, res, next) => {
  try {
    const result = await commentService.getCommentById(req.params.id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Update a comment
exports.updateComment = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const result = await commentService.updateComment(userId, id, content);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = error.message.includes('authorized') ? 403 : 404;
    next(error);
  }
});

// Delete a comment
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin;

  try {
    const result = await commentService.deleteComment(userId, id, isAdmin);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = error.message.includes('authorized') ? 403 : 404;
    next(error);
  }
});

// Like a comment
exports.likeComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await commentService.likeComment(userId, id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Dislike a comment
exports.dislikeComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await commentService.dislikeComment(userId, id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 404;
    next(error);
  }
});

// Get all comments by a user
exports.getUserComments = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  const result = await commentService.getUserComments(userId, req.query);
  if (result.success) {
    res.status(200).json(result);
  }
});

// Get recent comments (activity feed)
exports.getRecentComments = asyncHandler(async (req, res, next) => {
  const result = await commentService.getRecentComments(req.query);
  if (result.success) {
    res.status(200).json(result);
  }
}); 