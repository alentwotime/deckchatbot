const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}\nRoute: ${req.method} ${req.originalUrl}\nStack: ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
};
