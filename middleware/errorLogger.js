const logger = require('../utils/logger');
const config = require('../config');

/**
 * Error logging middleware
 * Logs errors and returns standardized error responses
 */
function errorLogger(err, req, res, next) {
  // Log the error with context
  logger.error('Request error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'File size exceeds maximum allowed limit'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.isDevelopment ? err.message : 'Something went wrong',
    ...(config.isDevelopment && { stack: err.stack })
  });
}

module.exports = errorLogger;
