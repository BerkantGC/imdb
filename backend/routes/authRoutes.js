const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProfilePhoto } = require('../middleware/upload');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    uploadProfilePhoto,
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters long and contain one number and one special character')
      .isLength({ min: 8 })
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty()
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  protect,
  uploadProfilePhoto,
  [
    check('email', 'Please include a valid email').optional().isEmail(),
    check('firstName', 'First name must be a string').optional().isString(),
    check('lastName', 'Last name must be a string').optional().isString(),
    check('country', 'Country must be a string').optional().isString(),
    check('city', 'City must be a string').optional().isString()
  ],
  authController.updateProfile
);

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put(
  '/password',
  protect,
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 8 characters long and contain one number and one special character')
      .isLength({ min: 8 })
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
  ],
  authController.changePassword
);

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', authController.verifyToken);

// @route   PUT /api/auth/deactivate
// @desc    Deactivate user account
// @access  Private
router.put('/deactivate', protect, authController.deactivateAccount);

// @route   GET /api/auth/logout
// @desc    Logout user (client-side)
// @access  Public
router.get('/logout', authController.logout);

// --- Admin Routes ---

// @route   GET /api/auth/users
// @desc    Get all users (admin)
// @access  Admin
router.get('/users', protect, adminOnly, authController.getAllUsers);

// @route   PUT /api/auth/users/:userId/reactivate
// @desc    Reactivate a user account (admin)
// @access  Admin
router.put('/users/:userId/reactivate', protect, adminOnly, authController.reactivateAccount);

// @route   PUT /api/auth/users/:userId
// @desc    Update user by admin
// @access  Admin
router.put('/users/:userId', protect, adminOnly, authController.updateUserByAdmin);

module.exports = router; 