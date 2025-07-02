const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const path = require('path');
const { deleteFile } = require('../middleware/upload');
const { generateToken } = require('../services/authService');

// Asynchronous wrapper for route handlers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// User Registration
exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { email, password, firstName, lastName, country, city } = req.body;
  const profilePhoto = req.file ? req.file.path : null;

  try {
    console.log('Registration attempt:', { email, firstName, lastName, country, city, hasPhoto: !!profilePhoto });
    
    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      country,
      city,
      profilePhoto
    });

    if (result.success) {
      res.status(201).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    if (req.file) {
      deleteFile(req.file.path);
    }
    return res.status(400).json({ message: error.message });
  }
});

// User Login
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  try {
    const result = await authService.loginUser(email, password);
    if (result.success) {
      console.log('Login successful for:', email);
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(401).json({ message: error.message });
  }
});

// Get User Profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.getUserProfile(req.user.id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
});

// Update User Profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const updateData = { ...req.body };
  if (req.file) {
    updateData.profilePhoto = req.file.path;
  }

  try {
    const result = await authService.updateUserProfile(req.user.id, updateData);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
});

// Change Password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

// Verify JWT Token
exports.verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.verifyToken(req.body.token);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
});

exports.deactivateAccount = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.deactivateAccount(req.user.id);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
});

exports.reactivateAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  try {
    const result = await authService.reactivateAccount(userId);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
});

// Get all users (Admin only)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  try {
    const result = await authService.getAllUsers({ page, limit, search });
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
});

exports.updateUserByAdmin = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const updateData = req.body;
  try {
    const result = await authService.updateUserByAdmin(userId, updateData);
    if (result.success) {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
});

// User Logout - clear cookie token on client side
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Successfully logged out',
    data: {
      tokenExpired: true
    }
  });
};
