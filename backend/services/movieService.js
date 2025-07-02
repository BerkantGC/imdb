const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

class MovieService {
  // Calculate popularity score for a movie
  calculatePopularityScore(movie) {
    const {
      totalRatings = 0,
      averageRating = 0,
      totalComments = 0,
      viewCount = 0
    } = movie;

    // Weights for different factors
    const RATING_WEIGHT = 0.4;
    const VIEW_WEIGHT = 0.3;
    const COMMENT_WEIGHT = 0.2;
    const RECENCY_WEIGHT = 0.1;

    // Normalize ratings (0-10 scale to 0-1)
    const normalizedRating = averageRating / 10;

    // Rating score: combines average rating with number of ratings
    // Uses a confidence interval approach where more ratings = more confidence
    const ratingScore = totalRatings > 0 
      ? (normalizedRating * Math.min(totalRatings / 100, 1)) 
      : 0;

    // View score: logarithmic scaling to prevent extremely high view counts from dominating
    const viewScore = viewCount > 0 
      ? Math.log10(viewCount + 1) / 6 // Assuming max ~1M views gives score of 1
      : 0;

    // Comment score: similar to ratings, but with different threshold
    const commentScore = totalComments > 0 
      ? Math.min(totalComments / 50, 1) 
      : 0;

    // Recency score: newer movies get slight boost
    const monthsOld = (Date.now() - new Date(movie.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const recencyScore = Math.max(0, 1 - (monthsOld / 36)); // Decays over 3 years

    // Calculate weighted score
    const popularityScore = (
      ratingScore * RATING_WEIGHT +
      viewScore * VIEW_WEIGHT +
      commentScore * COMMENT_WEIGHT +
      recencyScore * RECENCY_WEIGHT
    ) * 100; // Scale to 0-100

    return Math.round(popularityScore * 100) / 100; // Round to 2 decimal places
  }

  // Update popularity score for a single movie
  async updateMoviePopularityScore(movieId) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      const popularityScore = this.calculatePopularityScore(movie);
      movie.popularityScore = popularityScore;
      await movie.save();

      return popularityScore;
    } catch (error) {
      throw error;
    }
  }

  // Update popularity scores for all movies
  async updateAllPopularityScores() {
    try {
      const movies = await Movie.find({ isActive: true });
      const updatePromises = movies.map(async (movie) => {
        const popularityScore = this.calculatePopularityScore(movie);
        return Movie.findByIdAndUpdate(movie._id, { popularityScore });
      });

      await Promise.all(updatePromises);
      return { success: true, updated: movies.length };
    } catch (error) {
      throw error;
    }
  }

  // Get all movies with pagination and filtering
  async getMovies(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        genre,
        releaseYear,
        minRating,
        search
      } = options;

      const skip = (page - 1) * limit;
      const query = { isActive: true };

      // Add filters
      if (genre) {
        query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
      }

      if (releaseYear) {
        query.releaseYear = releaseYear;
      }

      if (minRating) {
        query.averageRating = { $gte: minRating };
      }

      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const movies = await Movie.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Movie.countDocuments(query);

      return {
        success: true,
        movies,
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

  // Search movies by title, summary, or actors
  async searchMovies(searchTerm, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      // Create case-insensitive regex for partial matching
      const searchRegex = new RegExp(searchTerm.trim(), 'i');

      const query = {
        isActive: true,
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { actors: { $regex: searchRegex } },
          { director: { $regex: searchRegex } }
        ]
      };

      const movies = await Movie.find(query)
        .sort({ popularityScore: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Movie.countDocuments(query);

      return {
        success: true,
        movies,
        searchTerm,
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

  // Autocomplete search (returns max 3 matches for 3+ characters)
  async autocompleteSearch(searchTerm) {
    try {
      if (searchTerm.length < 3) {
        return {
          success: true,
          suggestions: []
        };
      }

      const searchRegex = new RegExp(searchTerm.trim(), 'i');

      const suggestions = await Movie.find({
        isActive: true,
        title: { $regex: searchRegex }
      })
      .select('title _id')
      .sort({ popularityScore: -1 })
      .limit(3)
      .lean();

      return {
        success: true,
        suggestions: suggestions.map(movie => ({
          id: movie._id,
          title: movie.title
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  // Get top movies by popularity
  async getTopMoviesByPopularity(limit = 10) {
    try {
      const movies = await Movie.find({ isActive: true })
        .sort({ popularityScore: -1 })
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

  // Get single movie by ID
  async getMovieById(movieId) {
    try {
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Increment view count
      await movie.incrementViewCount();

      return {
        success: true,
        movie
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new movie (admin only)
  async createMovie(movieData) {
    try {
      const movie = new Movie(movieData);
      await movie.save();

      // Calculate initial popularity score
      await this.updateMoviePopularityScore(movie._id);

      return {
        success: true,
        movie
      };
    } catch (error) {
      throw error;
    }
  }

  // Update movie (admin only)
  async updateMovie(movieId, updateData) {
    try {
      const movie = await Movie.findByIdAndUpdate(
        movieId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!movie) {
        throw new Error('Movie not found');
      }

      // Recalculate popularity score
      await this.updateMoviePopularityScore(movie._id);

      return {
        success: true,
        movie
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete movie (admin only)
  async deleteMovie(movieId) {
    try {
      const movie = await Movie.findByIdAndUpdate(
        movieId,
        { isActive: false },
        { new: true }
      );

      if (!movie) {
        throw new Error('Movie not found');
      }

      return {
        success: true,
        message: 'Movie deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get movie statistics
  async getMovieStats(movieId) {
    try {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Get rating distribution
      const ratingDistribution = await Rating.getRatingDistribution(movieId);
      
      // Get rating distribution by country
      const ratingByCountry = await Rating.getRatingDistributionByCountry(movieId);

      // Get recent comments
      const recentComments = await Comment.find({ movie: movieId, isActive: true })
        .populate('user', 'firstName lastName profilePhoto')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return {
        success: true,
        stats: {
          movie: movie.toJSON(),
          ratingDistribution,
          ratingByCountry,
          recentComments
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get trending movies (based on recent activity)
  async getTrendingMovies(days = 7, limit = 10) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get movies with recent ratings/comments
      const trendingMovies = await Movie.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'ratings',
            localField: '_id',
            foreignField: 'movie',
            as: 'recentRatings',
            pipeline: [
              { $match: { createdAt: { $gte: startDate } } }
            ]
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'movie',
            as: 'recentComments',
            pipeline: [
              { $match: { createdAt: { $gte: startDate }, isActive: true } }
            ]
          }
        },
        {
          $addFields: {
            recentActivity: {
              $add: [
                { $size: '$recentRatings' },
                { $size: '$recentComments' }
              ]
            }
          }
        },
        {
          $match: { recentActivity: { $gt: 0 } }
        },
        {
          $sort: { recentActivity: -1, popularityScore: -1 }
        },
        { $limit: parseInt(limit) },
        {
          $project: {
            recentRatings: 0,
            recentComments: 0
          }
        }
      ]);

      return {
        success: true,
        movies: trendingMovies
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MovieService(); 