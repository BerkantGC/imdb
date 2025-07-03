const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  actors: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  director: {
    type: String,
    trim: true,
    maxlength: 100
  },
  genre: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  releaseYear: {
    type: Number,
    min: 1888,
    max: new Date().getFullYear() + 5
  },
  duration: {
    type: Number,
    min: 1
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  trailerUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(v);
      },
      message: 'Invalid trailer URL format'
    }
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalComments: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for search optimization
movieSchema.index({ title: 'text', summary: 'text', actors: 'text' });
movieSchema.index({ popularityScore: -1 });
movieSchema.index({ averageRating: -1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ viewCount: -1 });
movieSchema.index({ isActive: 1 });

// Virtual for formatted duration
movieSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Method to increment view count
movieSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return this.save();
};

// Method to update rating statistics
movieSchema.methods.updateRatingStats = async function(newRating, oldRating = null) {
  const Rating = mongoose.model('Rating');
  
  // Calculate new average rating
  const ratings = await Rating.find({ movie: this._id }).select('rating');
  
  if (ratings.length > 0) {
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = Number((totalRating / ratings.length).toFixed(1));
    this.totalRatings = ratings.length;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }
  
  return this.save();
};

// Method to update comment count
movieSchema.methods.updateCommentCount = async function() {
  const Comment = mongoose.model('Comment');
  this.totalComments = await Comment.countDocuments({ movie: this._id });
  return this.save();
};

// Transform JSON output
movieSchema.methods.toJSON = function() {
  const movieObject = this.toObject();
  movieObject.formattedDuration = this.formattedDuration;
  delete movieObject.__v;
  return movieObject;
};

module.exports = mongoose.model('Movie', movieSchema); 