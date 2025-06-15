const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');

// 🔌 Initialize SQLite DB and tables
require('./utils/db');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 🌐 Global Middleware
const auth = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorLogger = require('./middleware/errorLogger');

// 📦 Route-level Controllers (for inline POSTs)
const shapeController = require('./controllers/shapeController');

// 🛣️ Full Route Index
const routes = require('./routes');

// 🌍 Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// 🔐 API Key Auth (enabled globally)
app.use(auth);

// 🧯 Request Rate Limiting & Logging
app.use(rateLimiter);
app.use(requestLogger);

// 🧭 API Routes
app.use(routes);
app.post('/calculate-multi-shape', shapeController.calculateMultiShape);

// 🖼️ Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 🔁 Fallback for client-side routing (SPA support)
app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    logger.info('📄 Served frontend index.html');
  } else {
    next();
  }
});

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 💥 Global Error Logger
app.use(errorLogger);

// 📦 Export for use in index.js (clustering)
module.exports = { app, logger };

// 🚀 Allow direct run (no cluster)
if (require.main === module) {
  const PORT = config.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`✅ Server running at http://localhost:${PORT}`);
  });
}
