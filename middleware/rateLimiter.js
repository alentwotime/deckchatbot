const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Maximum number of requests per window per IP
  max: 100,
  standardHeaders: true,
  message: (req, res) => {
    return 'Too many requests, please try again later.';
  },
});
