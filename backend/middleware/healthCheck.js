/**
 * Health Check Middleware
 * Provides endpoints for monitoring the health and status of the application
 */
const mongoose = require('mongoose');
const os = require('os');

/**
 * Sets up health check endpoints for the application
 * @param {Object} app - Express application instance
 */
exports.setupHealthCheck = (app) => {
  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  });

  // Detailed system status endpoint (protected)
  app.get('/health/status', async (req, res) => {
    try {
      // Check database connection
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      // Get system metrics
      const systemInfo = {
        uptime: Math.floor(process.uptime()),
        memory: {
          free: os.freemem(),
          total: os.totalmem(),
          usage: process.memoryUsage()
        },
        cpu: os.cpus().length,
        load: os.loadavg()
      };
      
      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          name: mongoose.connection.name || 'unknown'
        },
        api: {
          version: process.env.API_VERSION || '1.0.0',
          nodeVersion: process.version,
          environment: process.env.NODE_ENV
        },
        system: systemInfo
      });
    } catch (error) {
      res.status(500).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // More detailed metrics endpoint (for monitoring tools)
  app.get('/health/metrics', async (req, res) => {
    // This would typically be integrated with a metrics collector like Prometheus
    // For now, we'll just return some basic metrics
    try {
      const metrics = {
        process: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          uptime: process.uptime()
        },
        timestamp: Date.now()
      };
      
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
