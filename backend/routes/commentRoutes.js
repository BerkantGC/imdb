const express = require('express');
const router = express.Router();
const { check, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/movies/:movieId/comments
// @desc    Add a new comment to a movie
// @access  Private
router.post(
  '/movies/:movieId/comments',
  protect,
  [
    param('movieId', 'Invalid movie ID').isMongoId(),
    check('content', 'Comment content is required').not().isEmpty().trim().escape()
  ],
  commentController.addComment
);

// @route   GET /api/movies/:movieId/comments
// @desc    Get all comments for a movie
// @access  Public
router.get(
  '/movies/:movieId/comments',
  [param('movieId', 'Invalid movie ID').isMongoId()],
  commentController.getMovieComments
);

// @route   GET /api/comments/recent
// @desc    Get recent comments across all movies
// @access  Public
router.get('/recent', commentController.getRecentComments);

// @route   GET /api/comments/mine
// @desc    Get all comments by the logged-in user
// @access  Private
router.get('/mine', protect, commentController.getUserComments);

// @route   GET /api/comments/user/:userId
// @desc    Get all comments by a specific user
// @access  Public
router.get(
  '/user/:userId',
  [param('userId', 'Invalid user ID').isMongoId()],
  commentController.getUserComments
);

// @route   GET /api/comments/:id
// @desc    Get a single comment by its ID
// @access  Public
router.get(
  '/:id',
  [param('id', 'Invalid comment ID').isMongoId()],
  commentController.getCommentById
);

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (Owner only)
router.put(
  '/:id',
  protect,
  [
    param('id', 'Invalid comment ID').isMongoId(),
    check('content', 'Comment content is required').not().isEmpty().trim().escape()
  ],
  commentController.updateComment
);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (Owner or Admin)
router.delete(
  '/:id',
  protect,
  [param('id', 'Invalid comment ID').isMongoId()],
  commentController.deleteComment
);

// @route   POST /api/comments/:id/like
// @desc    Like a comment
// @access  Private
router.post(
  '/:id/like',
  protect,
  [param('id', 'Invalid comment ID').isMongoId()],
  commentController.likeComment
);

// @route   POST /api/comments/:id/dislike
// @desc    Dislike a comment
// @access  Private
router.post(
  '/:id/dislike',
  protect,
  [param('id', 'Invalid comment ID').isMongoId()],
  commentController.dislikeComment
);

module.exports = router; 