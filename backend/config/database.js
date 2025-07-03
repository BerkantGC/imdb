const mongoose = require('mongoose');
const { logger } = require('../middleware/requestLogger');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return logger.info('MongoDB: Using existing connection');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: isProd ? 20 : 10,
      minPoolSize: isProd ? 5 : 2,
      serverSelectionTimeoutMS: 7500,
      socketTimeoutMS: 60000,
    });

    isConnected = true;

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
      if (!global.isShuttingDown) setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

    if (process.env.REBUILD_INDEXES === 'true') {
      logger.info('Rebuilding indexes...');
      await mongoose.connection.db.command({ dropIndexes: '*' });
    }

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const closeConnection = async () => {
  if (!isConnected) return;
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    isConnected = false;
  } catch (err) {
    logger.error('Error closing MongoDB:', err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  global.isShuttingDown = true;
  await closeConnection();
  logger.info('MongoDB closed on app termination');
  process.exit(0);
});

module.exports = { connectDB, closeConnection, getConnectionStatus: () => isConnected };
