const Rating = require('../models/Rating');
const Movie = require('../models/Movie');
const User = require('../models/User');
const movieService = require('./movieService');

class RatingService {
  async rateMovie(userId, movieId, ratingValue) {
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) throw new Error('Movie not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const rating = await Rating.findOneAndUpdate(
      { user: userId, movie: movieId },
      { rating: ratingValue, userCountry: user.country },
      { upsert: true, new: true }
    );

    await movieService.updateMoviePopularityScore(movieId);
    return { success: true, rating: rating.toJSON() };
  }

  async getUserMovieRating(userId, movieId) {
    const rating = await Rating.findOne({ user: userId, movie: movieId });
    return { success: true, rating: rating?.toJSON() || null };
  }

  async getUserRatings(userId, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ user: userId })
      .populate('movie', 'title imageUrl averageRating totalRatings releaseYear')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Rating.countDocuments({ user: userId });

    return {
      success: true,
      ratings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async deleteRating(userId, movieId) {
    const rating = await Rating.findOneAndDelete({ user: userId, movie: movieId });
    if (!rating) throw new Error('Rating not found');

    await movieService.updateMoviePopularityScore(movieId);
    return { success: true, message: 'Rating deleted successfully' };
  }

  async getMovieRatingStats(movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) throw new Error('Movie not found');

    const ratingDistribution = await Rating.getRatingDistribution(movieId);
    const ratingByCountry = await Rating.getRatingDistributionByCountry(movieId);

    const stats = await Rating.aggregate([
      { $match: { movie: movie._id } },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          highestRating: { $max: '$rating' },
          lowestRating: { $min: '$rating' },
          totalCountries: { $addToSet: '$userCountry' }
        }
      }
    ]);

    return {
      success: true,
      movieId,
      stats: stats[0] || { totalRatings: 0, averageRating: 0, highestRating: 0, lowestRating: 0, totalCountries: 0 },
      ratingDistribution,
      ratingByCountry
    };
  }

  async getTopRatedMovies(options = {}) {
    const { limit = 10, minRatings = 5, genre, releaseYear } = options;

    const matchStage = { isActive: true, totalRatings: { $gte: minRatings } };
    if (genre) matchStage.genre = { $in: Array.isArray(genre) ? genre : [genre] };
    if (releaseYear) matchStage.releaseYear = releaseYear;

    const movies = await Movie.find(matchStage)
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(limit)
      .lean();

    return { success: true, movies };
  }
}

module.exports = new RatingService();
