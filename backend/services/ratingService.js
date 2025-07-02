const Rating = require('../models/Rating');
const Movie = require('../models/Movie');
const User = require('../models/User');
const movieService = require('./movieService');

class RatingService {
  // Add or update user rating for a movie
  async rateMovie(userId, movieId, ratingValue) {
    try {
      // Validate movie exists
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Get user info for country
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already rated this movie
      let rating = await Rating.findOne({ user: userId, movie: movieId });
      
      if (rating) {
        // Update existing rating
        rating.rating = ratingValue;
        rating.userCountry = user.country;
        await rating.save();
      } else {
        // Create new rating
        rating = new Rating({
          user: userId,
          movie: movieId,
          rating: ratingValue,
          userCountry: user.country
        });
        await rating.save();
      }

      // Update movie popularity score
      await movieService.updateMoviePopularityScore(movieId);

      return {
        success: true,
        rating: rating.toJSON(),
        message: 'Rating submitted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's rating for a specific movie
  async getUserMovieRating(userId, movieId) {
    try {
      const rating = await Rating.findOne({ user: userId, movie: movieId });
      
      return {
        success: true,
        rating: rating ? rating.toJSON() : null
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all ratings by a user
  async getUserRatings(userId, options = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const ratings = await Rating.find({ user: userId })
        .populate('movie', 'title imageUrl averageRating totalRatings releaseYear')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Rating.countDocuments({ user: userId });

      return {
        success: true,
        ratings,
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

  // Delete user rating
  async deleteRating(userId, movieId) {
    try {
      const rating = await Rating.findOneAndDelete({ user: userId, movie: movieId });
      
      if (!rating) {
        throw new Error('Rating not found');
      }

      // Update movie popularity score
      await movieService.updateMoviePopularityScore(movieId);

      return {
        success: true,
        message: 'Rating deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get rating statistics for a movie
  async getMovieRatingStats(movieId) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Get overall rating distribution
      const ratingDistribution = await Rating.getRatingDistribution(movieId);
      
      // Get rating distribution by country
      const ratingByCountry = await Rating.getRatingDistributionByCountry(movieId);

      // Get additional stats
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
        },
        {
          $project: {
            _id: 0,
            totalRatings: 1,
            averageRating: { $round: ['$averageRating', 1] },
            highestRating: 1,
            lowestRating: 1,
            totalCountries: { $size: '$totalCountries' }
          }
        }
      ]);

      return {
        success: true,
        movieId,
        stats: stats[0] || {
          totalRatings: 0,
          averageRating: 0,
          highestRating: 0,
          lowestRating: 0,
          totalCountries: 0
        },
        ratingDistribution,
        ratingByCountry
      };
    } catch (error) {
      throw error;
    }
  }

  // Get top rated movies
  async getTopRatedMovies(options = {}) {
    try {
      const { 
        limit = 10, 
        minRatings = 5, 
        genre, 
        releaseYear 
      } = options;

      const matchStage = {
        isActive: true,
        totalRatings: { $gte: minRatings }
      };

      if (genre) {
        matchStage.genre = { $in: Array.isArray(genre) ? genre : [genre] };
      }

      if (releaseYear) {
        matchStage.releaseYear = releaseYear;
      }

      const movies = await Movie.find(matchStage)
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(parseInt(limit))
        .lean();

      return {
        success: true,
        movies
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recent ratings (for activity feed)
  async getRecentRatings(options = {}) {
    try {
      const { limit = 20, days = 7 } = options;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const recentRatings = await Rating.find({
        createdAt: { $gte: startDate }
      })
      .populate('user', 'firstName lastName profilePhoto')
      .populate('movie', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

      return {
        success: true,
        ratings: recentRatings
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user rating statistics
  async getUserRatingStats(userId) {
    try {
      const stats = await Rating.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            highestRating: { $max: '$rating' },
            lowestRating: { $min: '$rating' },
            ratingBreakdown: {
              $push: '$rating'
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalRatings: 1,
            averageRating: { $round: ['$averageRating', 1] },
            highestRating: 1,
            lowestRating: 1,
            ratingBreakdown: 1
          }
        }
      ]);

      // Calculate rating distribution
      let ratingDistribution = {};
      if (stats[0] && stats[0].ratingBreakdown) {
        ratingDistribution = stats[0].ratingBreakdown.reduce((acc, rating) => {
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {});
      }

      return {
        success: true,
        stats: stats[0] || {
          totalRatings: 0,
          averageRating: 0,
          highestRating: 0,
          lowestRating: 0
        },
        ratingDistribution
      };
    } catch (error) {
      throw error;
    }
  }

  // Compare user ratings with overall ratings
  async compareUserRatings(userId, movieId) {
    try {
      const userRating = await Rating.findOne({ user: userId, movie: movieId });
      if (!userRating) {
        throw new Error('User has not rated this movie');
      }

      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      const difference = userRating.rating - movie.averageRating;

      return {
        success: true,
        comparison: {
          userRating: userRating.rating,
          averageRating: movie.averageRating,
          difference: Math.round(difference * 10) / 10,
          isAboveAverage: difference > 0,
          message: difference > 0 
            ? `You rated this ${Math.abs(difference).toFixed(1)} points higher than average`
            : difference < 0 
            ? `You rated this ${Math.abs(difference).toFixed(1)} points lower than average`
            : 'Your rating matches the average'
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RatingService(); 