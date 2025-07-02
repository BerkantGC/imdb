const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
  const profileDir = path.join(uploadDir, 'profiles');
  const movieDir = path.join(uploadDir, 'movies');

  [uploadDir, profileDir, movieDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
    
    // Determine subdirectory based on file field or route
    let subDir = '';
    if (file.fieldname === 'profilePhoto' || req.route.path.includes('profile')) {
      subDir = 'profiles';
    } else if (file.fieldname === 'movieImage' || req.route.path.includes('movie')) {
      subDir = 'movies';
    }
    
    const finalDir = path.join(uploadDir, subDir);
    
    // Ensure directory exists
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    cb(null, finalDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

// Middleware for single profile photo upload
const uploadProfilePhoto = upload.single('profilePhoto');

// Middleware for single movie image upload
const uploadMovieImage = upload.single('movieImage');

// Middleware for any single image upload
const uploadSingleImage = upload.single('image');

// Error handling wrapper
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Only one file allowed.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.'
          });
        }
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Helper function to delete uploaded file
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Middleware to clean up uploaded file on error
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(body) {
    if (res.statusCode >= 400 && req.file) {
      deleteFile(req.file.path);
    }
    originalSend.call(this, body);
  };

  res.json = function(body) {
    if (res.statusCode >= 400 && req.file) {
      deleteFile(req.file.path);
    }
    originalJson.call(this, body);
  };

  next();
};

module.exports = {
  upload,
  uploadProfilePhoto: handleUploadError(uploadProfilePhoto),
  uploadMovieImage: handleUploadError(uploadMovieImage),
  uploadSingleImage: handleUploadError(uploadSingleImage),
  deleteFile,
  cleanupOnError
}; 