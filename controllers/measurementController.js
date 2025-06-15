const Tesseract = require('tesseract.js');
const { polygonArea, calculatePerimeter, deckAreaExplanation } = require('../utils/geometry');
const { extractNumbers, parseMeasurement } = require('../utils/extract');
const { calculateSkirtingMetrics, ftIn } = require('../utils/skirting');
const logger = require('../utils/logger');
const memory = require('../memory');

// Converts feet + inches to decimal
function ftInToDecimal(feet = 0, inches = 0) {
  return parseFloat(feet) + parseFloat(inches || 0) / 12;
}

async function uploadMeasurements(req, res) {
  try {
    logger.info('🟡 Upload request received.');

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
    // If image mentions skirting, run the skirting estimator
    if (/skirting/i.test(text)) {
      const tokens = text.replace(/[’,]/g, "'").split(/\s+/);
      const idx = tokens.findIndex(t => /skirting/i.test(t));
      const vals = [];
      for (let i = idx + 1; i < tokens.length && vals.length < 3; i++) {
        const v = parseMeasurement(tokens[i]);
        if (typeof v === 'number' && !Number.isNaN(v)) {
          vals.push(v);
        }
      }
      if (vals.length >= 3) {
        const material = /PVC/i.test(text)
          ? 'PVC'
          : /Mineral\s*Board/i.test(text) || /Mineral/i.test(text)
            ? 'Mineral Board'
            : 'Composite';
        const result = calculateSkirtingMetrics({
          length: vals[0],
          width: vals[1],
          height: vals[2],
          material
        });
        return res.json({
          perimeter: ftIn(result.perimeter),
          skirtingArea: result.skirtingArea.toFixed(2),
          panelsNeeded: result.panelsNeeded,
          material: result.material,
          tip: result.tip,
          note: result.note
        });
      }
    }

  // ✅ 2. Consistent error format for test expectations
    if (numbers.length < 6) {
      return res.status(400).json({
        errors: [{
          msg: 'Not enough coordinates detected. Please ensure your drawing is clear and numbers are legible.'
        }]
      });
    }

    const hasPool = /pool/i.test(text);
    const midpoint = hasPool ? Math.floor(numbers.length / 2) : numbers.length;

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

  // ✅ SKIRTING LOGIC START
    const includeSkirting = /skirt|skirting/i.test(text);
    let skirting = null;

    if (includeSkirting) {
      const length = numbers[0] || 0;
      const width = numbers[2] || 0;
      const height = numbers[4] || 3; // default deck height

      const perimeter = calculatePerimeter(outerPoints); // handles any polygon shape
      const skirtingHeight = height;
      const skirtingArea = perimeter * skirtingHeight;
      const panelsNeeded = Math.ceil(skirtingArea / 32); // 4'x8' = 32 sq ft

      const material = /composite/i.test(text)
        ? 'Composite'
        : /pvc/i.test(text)
          ? 'PVC'
          : /mineral/i.test(text)
            ? 'Mineral Board'
            : 'Composite';

      skirting = {
        perimeterFt: perimeter.toFixed(2),
        heightFt: skirtingHeight.toFixed(2),
        skirtingArea: skirtingArea.toFixed(2),
        estimatedPanels: panelsNeeded,
        material,
        tip: 'Add 1–2 extra panels to cover waste and trimming.'
      };
    }
  // ✅ SKIRTING LOGIC END
    memory.addMeasurement({
      numbers,
      outerDeckArea: outerArea,
      poolArea,
      usableDeckArea,
      railingFootage,
      fasciaBoardLength
    });

    // Response JSON structure:
    // {
    //   outerDeckArea: string (total area of the outer deck in sq ft, 2 decimals),
    //   poolArea: string (area of pool cutout in sq ft, 2 decimals),
    //   usableDeckArea: string (deck area minus pool, in sq ft, 2 decimals),
    //   railingFootage: string (total perimeter/railing length in ft, 2 decimals),
    //   fasciaBoardLength: string (fascia board length in ft, 2 decimals),
    //   warning: string|null (warning message if area is large, else null),
    //   explanation: string (explanation of area calculation),
    //   skirting: object|null (skirting estimation details, if requested)
    // }
    res.json({
      outerDeckArea: outerArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: usableDeckArea.toFixed(2),
      railingFootage: railingFootage.toFixed(2),
      fasciaBoardLength: fasciaBoardLength.toFixed(2),
      warning,
      explanation,
      ...(skirting && { skirting })
    });

  } catch (err) {
    logger.error(`❌ Error in uploadMeasurements: ${err.stack}`);
    res.status(500).json({
      errors: [{ msg: 'Error processing image.' }]
    });
  }
}

module.exports = { uploadMeasurements };
