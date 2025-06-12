require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const path = require('path');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper functions
function rectangleArea(length, width) {
  return length * width;
}

function circleArea(radius) {
  return Math.PI * Math.pow(radius, 2);
}

function triangleArea(base, height) {
  return (base * height) / 2;
}

function shapeFromMessage(message) {
  const rectMatch = /rectangle\s*(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/i.exec(message);
  if (rectMatch) {
    return { type: 'rectangle', dimensions: { length: parseFloat(rectMatch[1]), width: parseFloat(rectMatch[2]) } };
  }
  const circleMatch = /circle\s*radius\s*(\d+(?:\.\d+)?)/i.exec(message);
  if (circleMatch) {
    return { type: 'circle', dimensions: { radius: parseFloat(circleMatch[1]) } };
  }
  const triMatch = /triangle\s*(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/i.exec(message);
  if (triMatch) {
    return { type: 'triangle', dimensions: { base: parseFloat(triMatch[1]), height: parseFloat(triMatch[2]) } };
  }
  return null;
}

function polygonArea(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    area += (x1 * y2 - x2 * y1);
  }
  return Math.abs(area / 2);
}

function calculatePerimeter(points) {
  let perimeter = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    perimeter += length;
  }
  return perimeter;
}

// Extract numbers from OCR text while removing inch/foot markers and
// filtering out obviously invalid values such as canvas dimensions.
function extractNumbers(rawText) {
  if (!rawText) return [];
  const cleaned = rawText.replace(/["'″’]/g, '');
  const numberPattern = /\d+(?:\.\d+)?/g;
  const matches = cleaned.match(numberPattern);
  if (!matches) return [];
  // Filter out numbers that are implausibly large for deck measurements.
  return matches.map(Number).filter(n => n <= 500);
}

app.use(express.static(path.join(__dirname)));

// Calculate multiple shapes
app.post(
  '/calculate-multi-shape',
  [
    body('shapes').isArray({ min: 1 }).withMessage('shapes must be a non-empty array'),
    body('shapes.*.type').isString().withMessage('shape type required'),
    body('wastagePercent').optional().isNumeric().withMessage('wastagePercent must be numeric')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shapes, wastagePercent = 0 } = req.body;
    let totalArea = 0;
    let poolArea = 0;
    shapes.forEach(shape => {
      const { type, dimensions, isPool } = shape;
      let area = 0;
      if (type === 'rectangle') {
        area = rectangleArea(dimensions.length, dimensions.width);
      } else if (type === 'circle') {
        area = circleArea(dimensions.radius);
      } else if (type === 'triangle') {
        area = triangleArea(dimensions.base, dimensions.height);
      } else if (type === 'polygon') {
        area = polygonArea(dimensions.points);
      } else {
        return res.status(400).json({ error: `Unsupported shape type: ${type}` });
      }
      if (isPool) {
        poolArea += area;
      } else {
        totalArea += area;
      }
    });
    const deckArea = totalArea - poolArea;
    const adjustedDeckArea = deckArea * (1 + wastagePercent / 100);
    res.json({
      totalShapeArea: totalArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: deckArea.toFixed(2),
      adjustedDeckArea: adjustedDeckArea.toFixed(2),
      note: wastagePercent ? `Adjusted for ${wastagePercent}% wastage.` : 'No wastage adjustment.'
    });
  }
);

// OCR Endpoint
app.post(
  '/upload-measurements',
  upload.single('image'),
  [
    body('image').custom((_, { req }) => {
      if (!req.file) {
        throw new Error('Image file is required');
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
        tessedit_pageseg_mode: 6,
        tessedit_char_whitelist: '0123456789.',
        logger: info => console.log(info)
      });
      console.log('OCR Output:', text);

      const numbers = extractNumbers(text);
      if (numbers.length < 6) {
        return res.status(400).json({
          error: 'Not enough numbers detected. Please ensure your measurements are clearly labeled and the photo is clear.'
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
      const deckArea = outerArea - poolArea;
      const railingFootage = calculatePerimeter(outerPoints);
      const fasciaBoardLength = railingFootage;

      const warning = deckArea > 1000
        ? 'Deck area exceeds 1000 sq ft. Please verify measurements.'
        : null;

      res.json({
        outerDeckArea: outerArea.toFixed(2),
        poolArea: poolArea.toFixed(2),
        usableDeckArea: deckArea.toFixed(2),
        railingFootage: railingFootage.toFixed(2),
        fasciaBoardLength: fasciaBoardLength.toFixed(2),
        warning
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error processing image.' });
    }
  }
);

// Chatbot Endpoint
app.post(
  '/chatbot',
  [body('message').isString().notEmpty().withMessage('message is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { message } = req.body;
    const calculationGuide = `
Here’s a detailed guide for calculating square footage and other shapes:
1. Rectangle: L × W
2. Triangle: (1/2) × Base × Height
3. Circle: π × Radius²
4. Half Circle: (1/2) × π × Radius²
5. Quarter Circle: (1/4) × π × Radius²
6. Trapezoid: (1/2) × (Base1 + Base2) × Height
7. Complex Shapes: sum of all simpler shapes’ areas.
8. Fascia Board: total perimeter length (excluding steps).
`;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are a smart math bot using this calculation guide:
${calculationGuide}
Always form follow-up questions if needed to clarify user data.` },
          { role: 'user', content: message }
        ]
      });
      res.json({ response: completion.choices[0].message.content });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error communicating with OpenAI.' });
    }
  }
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Decking Chatbot with Enhanced Calculation Guide running at http://localhost:${port}`);
  });
}

module.exports = {
  app,
  rectangleArea,
  circleArea,
  triangleArea,
  polygonArea,
  shapeFromMessage,
};
