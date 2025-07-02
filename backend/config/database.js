const mongoose = require('mongoose');
const { logger } = require('../middleware/requestLogger');

// Database connection state tracker
let isConnected = false;

/**
 * Connect to MongoDB with enhanced connection handling and retry logic
 */
const connectDB = async () => {
  if (isConnected) {
    logger.info('MongoDB: Using existing connection');
    return;
  }
  
  try {
    // Determine environment and set appropriate connection options
    const isProd = process.env.NODE_ENV === 'production';
    
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: isProd ? 20 : 10,                // Increase pool size for production
      minPoolSize: isProd ? 5 : 2,                  // Minimum connections to maintain
      serverSelectionTimeoutMS: 7500,               // Increased from 5000
      socketTimeoutMS: 60000,                       // Increased from 45000
      connectTimeoutMS: 30000,                      // Allow more time for initial connection
      bufferCommands: false,                        // Disable mongoose buffering
      heartbeatFrequencyMS: isProd ? 10000 : 30000, // More frequent heartbeats in production
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
      
      // Attempt to reconnect after a delay if not shutting down
      if (!global.isShuttingDown) {
        setTimeout(() => {
          logger.info('MongoDB attempting to reconnect...');
          connectDB().catch(err => {
            logger.error('MongoDB reconnection failed:', err);
          });
        }, 5000);
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });
    
    // Index management - ensure indexes are built
    if (process.env.REBUILD_INDEXES === 'true') {
      logger.info('Rebuilding database indexes...');
      await mongoose.connection.db.command({ dropIndexes: '*' });
    }
    
    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

/**
 * Gracefully close the MongoDB connection
 */
const closeConnection = async () => {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
    isConnected = false;
  } catch (err) {
    logger.error('Error while closing MongoDB connection:', err);
    process.exit(1);
  }
};

/**
 * Set up process event listeners for graceful shutdown
 */
process.on('SIGINT', async () => {
  try {
    global.isShuttingDown = true;
    await closeConnection();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error during MongoDB shutdown:', err);
    process.exit(1);
  }
});

// Export the database functions
module.exports = {
  connectDB,
  closeConnection,
  getConnectionStatus: () => isConnected
}; 