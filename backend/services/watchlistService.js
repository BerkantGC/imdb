const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');

class WatchlistService {
  // Add movie to user's watchlist
  async addToWatchlist(userId, movieId, options = {}) {
    try {
      const { priority = 'medium', notes = '' } = options;

      // Check if movie exists and is active
      const movie = await Movie.findOne({ _id: movieId, isActive: true });
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Check if movie is already in watchlist
      const existingEntry = await Watchlist.findOne({ user: userId, movie: movieId });
      if (existingEntry) {
        throw new Error('Movie is already in your watchlist');
      }

      // Create new watchlist entry
      const watchlistEntry = new Watchlist({
        user: userId,
        movie: movieId,
        priority,
        notes: notes.trim()
      });

      await watchlistEntry.save();

      // Populate movie details for response
      await watchlistEntry.populate('movie', 'title imageUrl averageRating totalRatings releaseYear duration');

      return {
        success: true,
        watchlistEntry: watchlistEntry.toJSON(),
        message: 'Movie added to watchlist successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Remove movie from user's watchlist
  async removeFromWatchlist(userId, movieId) {
    try {
      const watchlistEntry = await Watchlist.findOneAndDelete({ 
        user: userId, 
        movie: movieId 
      });

      if (!watchlistEntry) {
        throw new Error('Movie not found in your watchlist');
      }

      return {
        success: true,
        message: 'Movie removed from watchlist successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's watchlist with filtering and pagination
  async getUserWatchlist(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        isWatched = null,
        priority = null,
        sortBy = 'addedAt',
        sortOrder = 'desc'
      } = options;

      const watchlistData = await Watchlist.getUserWatchlistWithMovies(userId, {
        isWatched,
        priority,
        page,
        limit,
        sortBy,
        sortOrder
      });

      const total = await Watchlist.countDocuments({ 
        user: userId,
        ...(isWatched !== null && { isWatched }),
        ...(priority && { priority })
      });

      return {
        success: true,
        watchlist: watchlistData,
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

  // Mark movie as watched in watchlist
  async markAsWatched(userId, movieId, watched = true) {
    try {
      const watchlistEntry = await Watchlist.findOne({ user: userId, movie: movieId });
      
      if (!watchlistEntry) {
        throw new Error('Movie not found in your watchlist');
      }

      if (watched) {
        await watchlistEntry.markAsWatched();
      } else {
        await watchlistEntry.markAsUnwatched();
      }

      return {
        success: true,
        watchlistEntry: watchlistEntry.toJSON(),
        message: watched ? 'Movie marked as watched' : 'Movie marked as unwatched'
      };
    } catch (error) {
      throw error;
    }
  }

  // Update watchlist entry (priority, notes)
  async updateWatchlistEntry(userId, movieId, updateData) {
    try {
      const { priority, notes } = updateData;

      const watchlistEntry = await Watchlist.findOne({ user: userId, movie: movieId });
      
      if (!watchlistEntry) {
        throw new Error('Movie not found in your watchlist');
      }

      // Update fields if provided
      if (priority !== undefined) {
        watchlistEntry.priority = priority;
      }
      if (notes !== undefined) {
        watchlistEntry.notes = notes.trim();
      }

      await watchlistEntry.save();

      return {
        success: true,
        watchlistEntry: watchlistEntry.toJSON(),
        message: 'Watchlist entry updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if movie is in user's watchlist
  async isInWatchlist(userId, movieId) {
    try {
      const watchlistEntry = await Watchlist.findOne({ user: userId, movie: movieId });
      
      return {
        success: true,
        inWatchlist: !!watchlistEntry,
        entry: watchlistEntry ? watchlistEntry.toJSON() : null
      };
    } catch (error) {
      throw error;
    }
  }

  // Get watchlist statistics for user
  async getWatchlistStats(userId) {
    try {
      const stats = await Watchlist.getUserWatchlistStats(userId);
      
      return {
        success: true,
        stats: stats[0] || {
          totalMovies: 0,
          watchedMovies: 0,
          unwatchedMovies: 0,
          priorityBreakdown: {
            high: 0,
            medium: 0,
            low: 0
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recently added movies to watchlist
  async getRecentlyAdded(userId, options = {}) {
    try {
      const { limit = 5, days = 30 } = options;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const recentlyAdded = await Watchlist.find({
        user: userId,
        addedAt: { $gte: startDate }
      })
      .populate('movie', 'title imageUrl averageRating releaseYear')
      .sort({ addedAt: -1 })
      .limit(parseInt(limit))
      .lean();

      return {
        success: true,
        recentlyAdded
      };
    } catch (error) {
      throw error;
    }
  }

  // Get watchlist recommendations based on user's watchlist
  async getWatchlistRecommendations(userId, options = {}) {
    try {
      const { limit = 10 } = options;

      // Get user's watchlist genres and actors
      const userWatchlist = await Watchlist.find({ user: userId })
        .populate('movie', 'genre actors averageRating')
        .lean();

      if (userWatchlist.length === 0) {
        return {
          success: true,
          recommendations: []
        };
      }

      // Extract genres and actors from watchlist
      const genres = new Set();
      const actors = new Set();

      userWatchlist.forEach(entry => {
        if (entry.movie && entry.movie.genre) {
          entry.movie.genre.forEach(g => genres.add(g));
        }
        if (entry.movie && entry.movie.actors) {
          entry.movie.actors.forEach(a => actors.add(a));
        }
      });

      // Get movie IDs already in watchlist
      const watchlistMovieIds = userWatchlist.map(entry => entry.movie._id);

      // Find similar movies not in watchlist
      const recommendations = await Movie.find({
        _id: { $nin: watchlistMovieIds },
        isActive: true,
        $or: [
          { genre: { $in: Array.from(genres) } },
          { actors: { $in: Array.from(actors) } }
        ]
      })
      .sort({ popularityScore: -1, averageRating: -1 })
      .limit(parseInt(limit))
      .lean();

      return {
        success: true,
        recommendations
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's watchlist summary
  async getWatchlistSummary(userId) {
    try {
      // Get basic stats
      const statsResult = await this.getWatchlistStats(userId);
      const stats = statsResult.stats;

      // Get recently added
      const recentlyAddedResult = await this.getRecentlyAdded(userId, { limit: 3 });
      const recentlyAdded = recentlyAddedResult.recentlyAdded;

      // Get high priority unwatched movies
      const highPriorityResult = await this.getUserWatchlist(userId, {
        priority: 'high',
        isWatched: false,
        limit: 5
      });
      const highPriorityMovies = highPriorityResult.watchlist;

      return {
        success: true,
        summary: {
          stats,
          recentlyAdded,
          highPriorityMovies
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdatePriority(userId, movieIds, priority) {
    try {
      const result = await Watchlist.updateMany(
        { 
          user: userId, 
          movie: { $in: movieIds } 
        },
        { priority }
      );

      return {
        success: true,
        updated: result.modifiedCount,
        message: `Updated priority for ${result.modifiedCount} movies`
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkMarkAsWatched(userId, movieIds, watched = true) {
    try {
      const updateData = watched 
        ? { isWatched: true, watchedAt: new Date() }
        : { isWatched: false, watchedAt: null };

      const result = await Watchlist.updateMany(
        { 
          user: userId, 
          movie: { $in: movieIds } 
        },
        updateData
      );

      return {
        success: true,
        updated: result.modifiedCount,
        message: `Marked ${result.modifiedCount} movies as ${watched ? 'watched' : 'unwatched'}`
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkRemoveFromWatchlist(userId, movieIds) {
    try {
      const result = await Watchlist.deleteMany({
        user: userId,
        movie: { $in: movieIds }
      });

      return {
        success: true,
        removed: result.deletedCount,
        message: `Removed ${result.deletedCount} movies from watchlist`
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WatchlistService(); 