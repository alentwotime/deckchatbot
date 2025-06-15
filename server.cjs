const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const logger = require('./utils/logger');

// 🔌 Initializes the SQLite database and creates tables
require('./utils/db');

const chatbotRoutes = require('./routes/chatbot');
const digitalizeController = require('./controllers/digitalizeController');
const measurementRoutes = require('./routes/measurements');
const shapeController = require('./controllers/shapeController');
const uploadDrawingRoutes = require('./routes/uploadDrawing');
const deckCalcRoutes = require('./routes/deckCalc');
const skirtingRoutes = require('./routes/skirting');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// API Routes
app.use('/chatbot', chatbotRoutes);
app.post('/digitalize-drawing', upload.single('image'), digitalizeController.digitalizeDrawing);
app.use('/upload-drawing', upload.single('image'), uploadDrawingRoutes);
app.use('/upload-measurements', measurementRoutes);
app.post('/calculate-multi-shape', shapeController.calculateMultiShape);
app.use('/calculate-deck', deckCalcRoutes);
app.use('/calculate-skirting', skirtingRoutes);

// Static File Serving (Frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Optional: fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Export for cluster usage
module.exports = { app, logger };

// Allow direct server startup
if (require.main === module) {
  const config = require('./config');
  const PORT = config.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`✅ Server running at http://localhost:${PORT}`);
  });
}
console.log('💡 Static middleware initialized');
