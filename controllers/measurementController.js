const Tesseract = require('tesseract.js');
const { polygonArea, calculatePerimeter, deckAreaExplanation } = require('../utils/geometry');
const { extractNumbers } = require('../utils/extract');
const logger = require('../utils/logger');
const memory = require('../memory');

async function uploadMeasurements(req, res) {
  try {
    logger.info('🟡 Upload request received.');

    // ✅ 1. Prevent multer crash if no image
    if (!req.file) {
      logger.warn('⚠️ No image file received in upload.');
      return res.status(400).json({
        errors: [{ msg: 'Image file is required' }]
      });
    }

    logger.info(`📸 Processing image: ${req.file.originalname || 'buffer upload'}`);

    const {
      data: { text }
    } = await Tesseract.recognize(req.file.buffer, 'eng', {
      tessedit_pageseg_mode: 6,
      // Allow foot (') and inch (") symbols in OCR results
      tessedit_char_whitelist: "0123456789.'\"",
      logger: info => logger.debug(info)
    });

    const numbers = extractNumbers(text);
    logger.info(`🔢 Extracted numbers: ${numbers.join(', ')}`);

    // ✅ 2. Consistent error format for test expectations
  if (numbers.length < 6) {
  return res.status(400).json({
    errors: [{
      msg: 'Not enough coordinates detected. Please ensure your drawing is clear and numbers are legible.'
    }]
  });
}

    const hasPool = /pool/i.test(text);
    const midpoint = hasPool ? numbers.length / 2 : numbers.length;

    const outerPoints = [];
    for (let i = 0; i < midpoint; i += 2) {
      outerPoints.push({ x: numbers[i], y: numbers[i + 1] });
    }

    const poolPoints = [];
    if (hasPool) {
      for (let i = midpoint; i < numbers.length; i += 2) {
        poolPoints.push({ x: numbers[i], y: numbers[i + 1] });
      }
    }

    const outerArea = polygonArea(outerPoints);
    const poolArea = hasPool ? polygonArea(poolPoints) : 0;
    const usableDeckArea = outerArea - poolArea;
    const railingFootage = calculatePerimeter(outerPoints);
    const fasciaBoardLength = railingFootage;

    const warning = usableDeckArea > 1000
      ? 'Deck area exceeds 1000 sq ft. Please verify measurements.'
      : null;

    const explanation = deckAreaExplanation({
      hasCutout: poolArea > 0,
      hasMultipleShapes: poolArea > 0
    });

    memory.addMeasurement({
      numbers,
      outerDeckArea: outerArea,
      poolArea,
      usableDeckArea,
      railingFootage,
      fasciaBoardLength
    });

    res.json({
      outerDeckArea: outerArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: usableDeckArea.toFixed(2),
      railingFootage: railingFootage.toFixed(2),
      fasciaBoardLength: fasciaBoardLength.toFixed(2),
      warning,
      explanation
    });
  } catch (err) {
    logger.error(`❌ Error in uploadMeasurements: ${err.stack}`);
    res.status(500).json({
      errors: [{ msg: 'Error processing image.' }]
    });
  }
}

module.exports = { uploadMeasurements };
