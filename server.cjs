// This file is for CommonJS environments; use './server.js' for ES modules.
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Middleware imports
const auth = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorLogger = require('./middleware/errorLogger');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

// Route imports
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & optimization middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);
module.exports = app;
// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware for protected routes
app.use('/api', auth);

// Mount all routes
app.use('/', routes);

// Error handling
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Deck Chatbot Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = { app, server };
