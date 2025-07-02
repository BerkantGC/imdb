/**
 * Custom request logger middleware
 * Provides structured logging for API requests in production
 */
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'movie-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Add file transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ]
      : [])
  ]
});

/**
 * Sets up request logging middleware for the application
 * @param {Object} app - Express application instance
 */
exports.setupRequestLogger = (app) => {
  app.use((req, res, next) => {
    // Capture request start time
    req.startTime = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function
    res.end = function(chunk, encoding) {
      // Calculate response time
      const responseTime = Date.now() - req.startTime;
      
      // Log the request details
      logger.info({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user ? req.user.id : 'anonymous'
      });
      
      // Call the original end function
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  });
};

// Export the logger for use in other parts of the application
exports.logger = logger;
