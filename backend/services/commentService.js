const Comment = require('../models/Comment');
const Movie = require('../models/Movie');
const movieService = require('./movieService');

class CommentService {
  async addComment(userId, movieId, content) {
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) throw new Error('Movie not found');

    const comment = new Comment({ user: userId, movie: movieId, content: content.trim() });
    await comment.save();
    
    await movie.updateCommentCount();
    await movieService.updateMoviePopularityScore(movieId);
    await comment.populate('user', 'firstName lastName profilePhoto');

    return { success: true, comment: comment.toJSON(), message: 'Comment added successfully' };
  }

  async getMovieComments(movieId, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [comments, total] = await Promise.all([
      Comment.find({ movie: movieId, isActive: true })
        .populate('user', 'firstName lastName profilePhoto country')
        .sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Comment.countDocuments({ movie: movieId, isActive: true })
    ]);

    return {
      success: true,
      comments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    };
  }

  async updateComment(userId, commentId, newContent) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.user.toString() !== userId.toString()) throw new Error('Not authorized');

    comment.content = newContent.trim();
    comment.isEdited = true;
    await comment.save();
    await comment.populate('user', 'firstName lastName profilePhoto');

    return { success: true, comment: comment.toJSON(), message: 'Comment updated successfully' };
  }

  async deleteComment(userId, commentId, isAdmin = false) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');
    if (!isAdmin && comment.user.toString() !== userId.toString()) throw new Error('Not authorized');

    comment.isActive = false;
    await comment.save();

    const movie = await Movie.findById(comment.movie);
    if (movie) {
      await movie.updateCommentCount();
      await movieService.updateMoviePopularityScore(comment.movie);
    }

    return { success: true, message: 'Comment deleted successfully' };
  }

  async likeComment(userId, commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment || !comment.isActive) throw new Error('Comment not found');

    await comment.likeComment(userId);
    return { success: true, likes: comment.likes, dislikes: comment.dislikes, message: 'Comment liked/unliked successfully' };
  }

  async dislikeComment(userId, commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment || !comment.isActive) throw new Error('Comment not found');

    await comment.dislikeComment(userId);
    return { success: true, likes: comment.likes, dislikes: comment.dislikes, message: 'Comment disliked/undisliked successfully' };
  }
}

module.exports = new CommentService();
