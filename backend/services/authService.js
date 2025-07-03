const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  }

  async registerUser(userData) {
    const { email, password, firstName, lastName, country, city, profilePhoto } = userData;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) throw new Error('User already exists with this email');

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
    return { success: true, token: this.generateToken(user._id), user: user.toJSON() };
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error('Invalid email or password');
    if (!user.isActive) throw new Error('Account is deactivated. Please contact support.');
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    return { success: true, token: this.generateToken(user._id), user: user.toJSON() };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('Account is deactivated');
    return { success: true, user: user.toJSON() };
  }

  async updateUserProfile(userId, updateData) {
    const { firstName, lastName, country, city, profilePhoto } = updateData;
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (country !== undefined) user.country = country.trim();
    if (city !== undefined) user.city = city.trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();
    return { success: true, user: user.toJSON() };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.password) {
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    return { success: true, message: 'Password updated successfully' };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) throw new Error('Invalid token');
      return { success: true, user: user.toJSON() };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async deactivateAccount(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    user.isActive = false;
    await user.save();
    return { success: true, message: 'Account deactivated successfully' };
  }

  async reactivateAccount(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    user.isActive = true;
    await user.save();
    return { success: true, message: 'Account reactivated successfully' };
  }
}

module.exports = new AuthService();
