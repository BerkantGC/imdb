const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/User');
const { logger } = require('../middleware/requestLogger');

/**
 * JWT Strategy Configuration
 * Authenticates requests using a JWT token in the Authorization header
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
  ignoreExpiration: false
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find the user specified in token
      const user = await User.findById(payload.id);

      // If user doesn't exist, handle it
      if (!user) {
        logger.info(`User not found for JWT payload ID: ${payload.id}`);
        return done(null, false);
      }
      
      // Check if token was issued before password change
      const tokenIssuedAt = payload.iat * 1000; // Convert to milliseconds
      if (user.passwordChangedAt && tokenIssuedAt < user.passwordChangedAt.getTime()) {
        logger.info(`Token issued before password change for user: ${payload.id}`);
        return done(null, false);
      }

      // Otherwise, return the user
      return done(null, user);
    } catch (error) {
      logger.error('JWT Strategy error:', error);
      done(error, false);
    }
  })
);

/**
 * Local Strategy Configuration
 * Authenticates requests using username and password
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        
        // If user doesn't exist or password doesn't match
        if (!user || !(await user.comparePassword(password))) {
          logger.info(`Invalid login attempt for email: ${email}`);
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        // Return user if everything is OK
        return done(null, user);
      } catch (error) {
        logger.error('Local Strategy error:', error);
        done(error);
      }
    }
  )
);

module.exports = passport;
