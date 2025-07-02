const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for optimization
commentSchema.index({ movie: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ isActive: 1 });

// Prevent duplicate user interactions
commentSchema.index({ user: 1, likedBy: 1 }, { sparse: true });
commentSchema.index({ user: 1, dislikedBy: 1 }, { sparse: true });

// Method to like comment
commentSchema.methods.likeComment = async function(userId) {
  const userIdStr = userId.toString();
  
  // Remove from dislikes if exists
  const dislikeIndex = this.dislikedBy.findIndex(id => id.toString() === userIdStr);
  if (dislikeIndex !== -1) {
    this.dislikedBy.splice(dislikeIndex, 1);
    this.dislikes = Math.max(0, this.dislikes - 1);
  }
  
  // Toggle like
  const likeIndex = this.likedBy.findIndex(id => id.toString() === userIdStr);
  if (likeIndex === -1) {
    this.likedBy.push(userId);
    this.likes += 1;
  } else {
    this.likedBy.splice(likeIndex, 1);
    this.likes = Math.max(0, this.likes - 1);
  }
  
  return this.save();
};

// Method to dislike comment
commentSchema.methods.dislikeComment = async function(userId) {
  const userIdStr = userId.toString();
  
  // Remove from likes if exists
  const likeIndex = this.likedBy.findIndex(id => id.toString() === userIdStr);
  if (likeIndex !== -1) {
    this.likedBy.splice(likeIndex, 1);
    this.likes = Math.max(0, this.likes - 1);
  }
  
  // Toggle dislike
  const dislikeIndex = this.dislikedBy.findIndex(id => id.toString() === userIdStr);
  if (dislikeIndex === -1) {
    this.dislikedBy.push(userId);
    this.dislikes += 1;
  } else {
    this.dislikedBy.splice(dislikeIndex, 1);
    this.dislikes = Math.max(0, this.dislikes - 1);
  }
  
  return this.save();
};

// Transform JSON output
commentSchema.methods.toJSON = function() {
  const commentObject = this.toObject();
  delete commentObject.__v;
  delete commentObject.likedBy;
  delete commentObject.dislikedBy;
  return commentObject;
};

module.exports = mongoose.model('Comment', commentSchema); 