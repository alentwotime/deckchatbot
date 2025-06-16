const Tesseract = require('tesseract.js');
const { addMeasurement } = require('../memory');
const { polygonArea, calculatePerimeter, ftInToDecimal } = require('../utils/geometry');
const logger = require('../utils/logger');

/**
 * Extract measurements from uploaded images using OCR
 */
async function uploadMeasurements(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        errors: [{ msg: 'No image file uploaded. Please attach an image.' }]
      });
    }

    logger.info('Processing measurement image', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Perform OCR on the uploaded image
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
      logger: m => logger.debug('OCR progress:', m)
    });

    logger.debug('OCR text extracted:', { text });

    // Extract numbers from the OCR text
    const numberMatches = text.match(/\d+(?:\.\d+)?/g) || [];
    const numbers = numberMatches
      .map(n => parseFloat(n))
      .filter(n => !isNaN(n) && n > 0 && n <= 500); // Filter reasonable measurements

    if (numbers.length < 4) {
      return res.status(400).json({
        errors: [{ msg: 'Could not extract enough measurements from the image. Please ensure the drawing has clear dimension labels.' }]
      });
    }

    logger.info('Numbers extracted from image:', { numbers });

    // Determine if this includes a pool cutout
    const hasPool = /pool|cutout|spa|hot tub/i.test(text);
    const midpoint = hasPool ? Math.floor(numbers.length / 2) : numbers.length;

    // Create coordinate points for the main deck area
    const outerPoints = [];
    for (let i = 0; i < midpoint; i += 2) {
      if (i + 1 < midpoint) {
        outerPoints.push({
          x: numbers[i],
          y: numbers[i + 1]
        });
      }
    }

    // Calculate deck area
    let outerDeckArea = 0;
    let poolArea = 0;

    if (outerPoints.length >= 3) {
      outerDeckArea = polygonArea(outerPoints);
    } else if (outerPoints.length === 2) {
      // Assume rectangle
      outerDeckArea = outerPoints[0].x * outerPoints[0].y;
    }

    // Handle pool cutout if present
    if (hasPool && numbers.length > midpoint) {
      const poolPoints = [];
      for (let i = midpoint; i < numbers.length; i += 2) {
        if (i + 1 < numbers.length) {
          poolPoints.push({
            x: numbers[i],
            y: numbers[i + 1]
          });
        }
      }

      if (poolPoints.length >= 3) {
        poolArea = polygonArea(poolPoints);
      } else if (poolPoints.length === 2) {
        poolArea = poolPoints[0].x * poolPoints[0].y;
      }
    }

    const usableDeckArea = outerDeckArea - poolArea;
    const perimeter = outerPoints.length >= 3 ? calculatePerimeter(outerPoints) : 0;

    // Check for skirting request
    const needsSkirting = /skirting|skirt|underdeck/i.test(text);
    let skirting = null;

    if (needsSkirting) {
      // Extract height information for skirting
      const heightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|')/i);
      const height = heightMatch ? ftInToDecimal(heightMatch[1]) : 3; // Default 3ft

      skirting = {
        perimeter: perimeter.toFixed(2),
        height: height.toFixed(2),
        panelsNeeded: Math.ceil(perimeter / 8), // Assuming 8ft panels
        linearFeet: perimeter.toFixed(2)
      };
    }

    const result = {
      outerDeckArea: outerDeckArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: usableDeckArea.toFixed(2),
      railingFootage: perimeter.toFixed(2),
      fasciaBoardLength: perimeter.toFixed(2),
      warning: usableDeckArea > 1000 ? 'Large deck area detected. Please verify measurements.' : null,
      explanation: `Calculated from ${outerPoints.length} points. ${hasPool ? 'Pool area subtracted.' : ''}`,
      skirting
    };

    // Save to memory
    addMeasurement(result);

    logger.info('Measurement extraction completed', result);

    res.json(result);
  } catch (error) {
    logger.error('Error processing measurements:', error);
    res.status(500).json({
      errors: [{ msg: 'Error processing image. Please try again with a clearer image.' }]
    });
  }
}

module.exports = {
  uploadMeasurements
};
