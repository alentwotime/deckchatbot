const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const auth = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorLogger = require('./middleware/errorLogger');
const requestLogger = require('./middleware/requestLogger');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Security & optimization middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Authentication
app.use(auth);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/', routes);

// Error handling
app.use(errorLogger);

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = { app, logger };