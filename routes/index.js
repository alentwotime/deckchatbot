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
    message: 'Drawing uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    digitalizeResult: {
      shapes: [],
      dimensions: {},
      area: 0
    }
  });
});

// Multi-shape calculator endpoint
router.post('/calculate-multi-shape', (req, res) => {
  try {
    const { shapes } = req.body;
    
    if (!shapes || !Array.isArray(shapes)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Shapes array is required'
      });
    }

    let totalArea = 0;
    const calculations = [];

    for (const shape of shapes) {
      let area = 0;
      const { type, dimensions } = shape;

      switch (type) {
        case 'rectangle':
          area = dimensions.length * dimensions.width;
          break;
        case 'circle':
          area = Math.PI * Math.pow(dimensions.radius, 2);
          break;
        case 'triangle':
          area = 0.5 * dimensions.base * dimensions.height;
          break;
        default:
          continue;
      }

      totalArea += area;
      calculations.push({
        type,
        dimensions,
        area: parseFloat(area.toFixed(2))
      });
    }

    res.json({
      totalArea: parseFloat(totalArea.toFixed(2)),
      calculations
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

module.exports = router;
