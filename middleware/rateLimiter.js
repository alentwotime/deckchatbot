const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Rate limiting middleware
 * Protects against abuse and DoS attacks
 */
const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW, // 15 minutes
  max: config.RATE_LIMIT_MAX,   // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      errors: [{ 
        msg: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(config.RATE_LIMIT_WINDOW_MS / 1000)
      }]
    });
  },

  // Skip rate limiting for certain paths
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

module.exports = rateLimiter;
