const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isWatched: {
    type: Boolean,
    default: false
  },
  watchedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one entry per user per movie
watchlistSchema.index({ user: 1, movie: 1 }, { unique: true });

// Indexes for optimization
watchlistSchema.index({ user: 1, addedAt: -1 });
watchlistSchema.index({ user: 1, isWatched: 1 });
watchlistSchema.index({ user: 1, priority: 1 });

// Method to mark as watched
watchlistSchema.methods.markAsWatched = async function() {
  this.isWatched = true;
  this.watchedAt = new Date();
  return this.save();
};

// Method to mark as unwatched
watchlistSchema.methods.markAsUnwatched = async function() {
  this.isWatched = false;
  this.watchedAt = null;
  return this.save();
};

// Static method to get user's watchlist with movie details
watchlistSchema.statics.getUserWatchlistWithMovies = async function(userId, options = {}) {
  const { 
    isWatched = null, 
    priority = null, 
    page = 1, 
    limit = 20, 
    sortBy = 'addedAt', 
    sortOrder = 'desc' 
  } = options;
  
  const match = { user: new mongoose.Types.ObjectId(userId) };
  
  if (isWatched !== null) {
    match.isWatched = isWatched;
  }
  
  if (priority) {
    match.priority = priority;
  }
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (page - 1) * limit;
  
  return this.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'movies',
        localField: 'movie',
        foreignField: '_id',
        as: 'movieDetails'
      }
    },
    { $unwind: '$movieDetails' },
    { $match: { 'movieDetails.isActive': true } },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        user: 1,
        movie: 1,
        addedAt: 1,
        priority: 1,
        notes: 1,
        isWatched: 1,
        watchedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        movieDetails: {
          _id: 1,
          title: 1,
          summary: 1,
          actors: 1,
          director: 1,
          genre: 1,
          releaseYear: 1,
          duration: 1,
          imageUrl: 1,
          averageRating: 1,
          totalRatings: 1,
          popularityScore: 1
        }
      }
    }
  ]);
};

// Static method to get watchlist statistics for a user
watchlistSchema.statics.getUserWatchlistStats = async function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalMovies: { $sum: 1 },
        watchedMovies: { 
          $sum: { $cond: ['$isWatched', 1, 0] } 
        },
        unwatchedMovies: { 
          $sum: { $cond: ['$isWatched', 0, 1] } 
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        mediumPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
        },
        lowPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalMovies: 1,
        watchedMovies: 1,
        unwatchedMovies: 1,
        priorityBreakdown: {
          high: '$highPriority',
          medium: '$mediumPriority',
          low: '$lowPriority'
        }
      }
    }
  ]);
};

// Transform JSON output
watchlistSchema.methods.toJSON = function() {
  const watchlistObject = this.toObject();
  delete watchlistObject.__v;
  return watchlistObject;
};

module.exports = mongoose.model('Watchlist', watchlistSchema); 