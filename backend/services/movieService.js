const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');

class MovieService {
  // Calculate popularity score
  calculatePopularityScore(movie) {
    const { totalRatings = 0, averageRating = 0, totalComments = 0, viewCount = 0 } = movie;
    
    const ratingScore = totalRatings > 0 ? (averageRating / 10) * Math.min(totalRatings / 100, 1) : 0;
    const viewScore = viewCount > 0 ? Math.log10(viewCount + 1) / 6 : 0;
    const commentScore = totalComments > 0 ? Math.min(totalComments / 50, 1) : 0;
    
    const monthsOld = (Date.now() - new Date(movie.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const recencyScore = Math.max(0, 1 - (monthsOld / 36));
    
    const popularityScore = (ratingScore * 0.4 + viewScore * 0.3 + commentScore * 0.2 + recencyScore * 0.1) * 100;
    return Math.round(popularityScore * 100) / 100;
  }

  // Update popularity score
  async updateMoviePopularityScore(movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) throw new Error('Movie not found');
    
    movie.popularityScore = this.calculatePopularityScore(movie);
    await movie.save();
    return movie.popularityScore;
  }

  // Get movies with filters
  async getMovies(options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', genre, releaseYear, minRating, search } = options;
    const skip = (page - 1) * limit;
    const query = { isActive: true };

    if (genre) query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
    if (releaseYear) query.releaseYear = releaseYear;
    if (minRating) query.averageRating = { $gte: minRating };
    if (search) query.$text = { $search: search };

    const movies = await Movie.find(query).sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 }).skip(skip).limit(parseInt(limit)).lean();
    const total = await Movie.countDocuments(query);

    return {
      success: true,
      movies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    };
  }

  // Search movies
  async searchMovies(searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;
    const searchRegex = new RegExp(searchTerm.trim(), 'i');
    
    const movies = await Movie.find({
      isActive: true,
      $or: [
        { title: { $regex: searchRegex } },
        { summary: { $regex: searchRegex } },
        { actors: { $regex: searchRegex } },
        { director: { $regex: searchRegex } }
      ]
    }).sort({ popularityScore: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();

    const total = await Movie.countDocuments({ isActive: true, $or: [{ title: { $regex: searchRegex } }] });

    return { success: true, movies, searchTerm, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } };
  }

  // Get movie by ID
  async getMovieById(movieId) {
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) throw new Error('Movie not found');
    
    await movie.incrementViewCount();
    return { success: true, movie };
  }

  // Create movie
  async createMovie(movieData) {
    const movie = new Movie(movieData);
    await movie.save();
    await this.updateMoviePopularityScore(movie._id);
    return { success: true, movie };
  }

  // Update movie
  async updateMovie(movieId, updateData) {
    const movie = await Movie.findByIdAndUpdate(movieId, updateData, { new: true, runValidators: true });
    if (!movie) throw new Error('Movie not found');
    
    await this.updateMoviePopularityScore(movie._id);
    return { success: true, movie };
  }

  // Delete movie
  async deleteMovie(movieId) {
    const movie = await Movie.findByIdAndUpdate(movieId, { isActive: false }, { new: true });
    if (!movie) throw new Error('Movie not found');
    
    return { success: true, message: 'Movie deleted successfully' };
  }
}

module.exports = new MovieService();
