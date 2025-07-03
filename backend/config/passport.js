const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/User');
const { logger } = require('../middleware/requestLogger');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  ignoreExpiration: false
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find the user specified in token
      const user = await User.findById(payload.id);

      // If user doesn't exist, handle it
      if (!user) {
        return done(null, false);
      }
      
      const tokenIssuedAt = payload.iat * 1000; // milliseconds
      if (user.passwordChangedAt && tokenIssuedAt < user.passwordChangedAt.getTime()) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      logger.error('JWT Strategy error:', error);
      done(error, false);
    }
  })
);

module.exports = passport;
