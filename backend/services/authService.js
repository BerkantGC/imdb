const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Register new user
  async registerUser(userData) {
    try {
      const { email, password, firstName, lastName, country, city, profilePhoto } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim(),
        city: city.trim(),
        profilePhoto
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        token,
        user: user.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        token,
        user: user.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return {
        success: true,
        user: user.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const { firstName, lastName, country, city, profilePhoto } = updateData;

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update fields if provided
      if (firstName !== undefined) user.firstName = firstName.trim();
      if (lastName !== undefined) user.lastName = lastName.trim();
      if (country !== undefined) user.country = country.trim();
      if (city !== undefined) user.city = city.trim();
      if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

      await user.save();

      return {
        success: true,
        user: user.toJSON()
      };
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check current password
      if (user.password) {
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          throw new Error('Current password is incorrect');
        }
      }

      // Set new password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify JWT token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return {
        success: true,
        user: user.toJSON()
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Deactivate user account
  async deactivateAccount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isActive = false;
      await user.save();

      return {
        success: true,
        message: 'Account deactivated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Reactivate user account (admin only)
  async reactivateAccount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isActive = true;
      await user.save();

      return {
        success: true,
        message: 'Account reactivated successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService(); 