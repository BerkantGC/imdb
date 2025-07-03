const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 10'
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per user per movie
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

// Indexes for optimization
ratingSchema.index({ movie: 1 });
ratingSchema.index({ user: 1 });
ratingSchema.index({ rating: 1 });
ratingSchema.index({ userCountry: 1 });

// Post save middleware to update movie rating stats
ratingSchema.post('save', async function(doc) {
  try {
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(doc.movie);
    if (movie) {
      await movie.updateRatingStats();
    }
  } catch (error) {
    console.error('Error updating movie rating stats:', error);
  }
});

// Post remove middleware to update movie rating stats
ratingSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Movie = mongoose.model('Movie');
      const movie = await Movie.findById(doc.movie);
      if (movie) {
        await movie.updateRatingStats();
      }
    } catch (error) {
      console.error('Error updating movie rating stats after deletion:', error);
    }
  }
});

// Static method to get rating distribution by country for a movie
ratingSchema.statics.getRatingDistributionByCountry = async function(movieId) {
  return this.aggregate([
    { $match: { movie: mongoose.Types.ObjectId(movieId) } },
    {
      $group: {
        _id: '$userCountry',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingBreakdown: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        country: '$_id',
        averageRating: { $round: ['$averageRating', 1] }
      }
    },
    {
      $project: {
        _id: 0,
        country: 1,
        averageRating: 1,
        totalRatings: 1,
        ratingBreakdown: 1
      }
    },
    { $sort: { totalRatings: -1 } }
  ]);
};

// Static method to get overall rating distribution for a movie
ratingSchema.statics.getRatingDistribution = async function(movieId) {
  return this.aggregate([
    { $match: { movie: mongoose.Types.ObjectId(movieId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        rating: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

// Transform JSON output
ratingSchema.methods.toJSON = function() {
  const ratingObject = this.toObject();
  delete ratingObject.__v;
  return ratingObject;
};

module.exports = mongoose.model('Rating', ratingSchema); 