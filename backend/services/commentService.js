const Comment = require('../models/Comment');
const Movie = require('../models/Movie');
const movieService = require('./movieService');

class CommentService {
  // Add a comment to a movie
  async addComment(userId, movieId, content) {
    try {
      // Check if movie exists
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Create new comment
      const comment = new Comment({
        user: userId,
        movie: movieId,
        content: content.trim()
      });

      await comment.save();

      // Update movie's comment count and popularity score
      await movie.updateCommentCount();
      await movieService.updateMoviePopularityScore(movieId);

      // Populate user info for the response
      await comment.populate('user', 'firstName lastName profilePhoto');

      return {
        success: true,
        comment: comment.toJSON(),
        message: 'Comment added successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all comments for a movie with pagination
  async getMovieComments(movieId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const comments = await Comment.find({ movie: movieId, isActive: true })
        .populate('user', 'firstName lastName profilePhoto country')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Comment.countDocuments({ movie: movieId, isActive: true });

      return {
        success: true,
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get a single comment by ID
  async getCommentById(commentId) {
    try {
      const comment = await Comment.findOne({ _id: commentId, isActive: true })
        .populate('user', 'firstName lastName profilePhoto')
        .populate('movie', 'title');
        
      if (!comment) {
        throw new Error('Comment not found');
      }

      return {
        success: true,
        comment
      };
    } catch (error) {
      throw error;
    }
  }

  // Update a comment
  async updateComment(userId, commentId, newContent) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if the user owns the comment
      if (comment.user.toString() !== userId.toString()) {
        throw new Error('You are not authorized to update this comment');
      }

      comment.content = newContent.trim();
      comment.isEdited = true;
      await comment.save();

      await comment.populate('user', 'firstName lastName profilePhoto');

      return {
        success: true,
        comment: comment.toJSON(),
        message: 'Comment updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete a comment (soft delete)
  async deleteComment(userId, commentId, isAdmin = false) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user owns the comment or is an admin
      if (!isAdmin && comment.user.toString() !== userId.toString()) {
        throw new Error('You are not authorized to delete this comment');
      }

      comment.isActive = false;
      await comment.save();

      // Update movie's comment count and popularity score
      const movie = await Movie.findById(comment.movie);
      if (movie) {
        await movie.updateCommentCount();
        await movieService.updateMoviePopularityScore(comment.movie);
      }

      return {
        success: true,
        message: 'Comment deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Like a comment
  async likeComment(userId, commentId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment || !comment.isActive) {
        throw new Error('Comment not found');
      }

      await comment.likeComment(userId);

      return {
        success: true,
        likes: comment.likes,
        dislikes: comment.dislikes,
        message: 'Comment liked/unliked successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Dislike a comment
  async dislikeComment(userId, commentId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment || !comment.isActive) {
        throw new Error('Comment not found');
      }

      await comment.dislikeComment(userId);

      return {
        success: true,
        likes: comment.likes,
        dislikes: comment.dislikes,
        message: 'Comment disliked/undisliked successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get comments by a specific user
  async getUserComments(userId, options = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const comments = await Comment.find({ user: userId, isActive: true })
        .populate('movie', 'title imageUrl')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Comment.countDocuments({ user: userId, isActive: true });

      return {
        success: true,
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recent comments across all movies (for activity feed)
  async getRecentComments(options = {}) {
    try {
      const { limit = 20, days = 7 } = options;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const recentComments = await Comment.find({
        isActive: true,
        createdAt: { $gte: startDate }
      })
      .populate('user', 'firstName lastName profilePhoto')
      .populate('movie', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

      return {
        success: true,
        comments: recentComments
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CommentService(); 