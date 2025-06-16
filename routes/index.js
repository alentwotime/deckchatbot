const express = require('express');
const multer = require('multer');
const path = require('path');
const { chatbot, validate } = require('../controllers/chatbotController');
const { calculateDeckMaterials } = require('../controllers/deckCalcController');
const config = require('../config');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// Chatbot endpoint
router.post('/chatbot', validate, chatbot);

// Deck calculator endpoint
router.post('/calculate-deck-materials', calculateDeckMaterials);

// File upload endpoints
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

router.post('/digitalize-drawing', upload.single('drawing'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No drawing uploaded' });
  }

  // TODO: Implement drawing digitalization logic
  res.json({
    message: 'Drawing digitalized successfully',
    filename: req.file.filename
  });
});

module.exports = router;
