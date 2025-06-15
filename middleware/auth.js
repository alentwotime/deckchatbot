const config = require('../config');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Validates API key from Authorization header or x-api-key header
 */
function auth(req, res, next) {
  // Skip auth for public endpoints
  const publicEndpoints = ['/', '/health', '/favicon.ico'];
  if (publicEndpoints.includes(req.path) || req.path.startsWith('/public')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // Check for Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === config.API_KEY) {
      return next();
    }
  }

  // Check for API key header
  if (apiKey === config.API_KEY) {
    return next();
  }

  logger.warn(`Unauthorized access attempt from ${req.ip} to ${req.path}`);
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Valid API key required'
  });
}

module.exports = auth;
