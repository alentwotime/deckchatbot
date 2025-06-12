require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const path = require('path');
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

// Extract measurement numbers from OCR text.
// Prefer values that include explicit units (ft/in or quote symbols)
// to avoid accidentally using canvas dimensions.
function extractNumbers(rawText) {
  if (!rawText) return [];

  const results = [];
  const unitPattern = /(\d+(?:\.\d+)?)(?:\s*(?:ft|feet|foot|in|inch|inches)|\s*["'″’])/gi;
  let match;
  while ((match = unitPattern.exec(rawText)) !== null) {
    results.push(parseFloat(match[1]));
  }

  // Fallback to any numbers if none with units were found.
  if (results.length === 0) {
    const cleaned = rawText.replace(/["'″’]/g, '');
    const fallbackMatches = cleaned.match(/\d+(?:\.\d+)?/g);
    if (fallbackMatches) {
      results.push(...fallbackMatches.map(Number));
    }
  }

  // Remove obviously incorrect values (>500 ft) which may come from
  // misread canvas bounds or inch symbols interpreted as digits.
  return results.filter(n => n <= 500);
}

app.use(express.static(path.join(__dirname)));

app.post('/calculate-multi-shape', (req, res) => {
  const { shapes, wastagePercent = 0 } = req.body;
  if (!shapes || !Array.isArray(shapes) || shapes.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of shapes.' });
  }
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
  const hasCutout = shapes.some(s => s.isPool);
  let explanation =
    'When we calculate square footage, we only include the usable surface area of the deck.';
  if (shapes.length === 1 && !hasCutout) {
    explanation += ' This is a simple deck with no cutouts. The entire area is considered usable.';
  } else if (hasCutout) {
    explanation += ' This deck has a cutout — we subtract the inner shape (like a pool or opening) from the total area to get the usable surface.';
  } else {
    explanation += " You're working with a composite deck: a larger base shape with one or more cutouts. We subtract the inner areas from the outer to find your net square footage.";
  }
  res.json({
    totalShapeArea: totalArea.toFixed(2),
    poolArea: poolArea.toFixed(2),
    usableDeckArea: deckArea.toFixed(2),
    adjustedDeckArea: adjustedDeckArea.toFixed(2),
    note: wastagePercent ? `Adjusted for ${wastagePercent}% wastage.` : 'No wastage adjustment.',
    explanation
  });
});

// OCR Endpoint
app.post('/upload-measurements', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image.' });
    }
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
      warning,
      explanation: hasPool
        ? 'When we calculate square footage, we only include the usable surface area of the deck. This deck has a cutout — we subtract the inner shape from the total area to get the usable surface.'
        : 'When we calculate square footage, we only include the usable surface area of the deck. This is a simple deck with no cutouts. The entire area is considered usable.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing image.' });
  }
});

// Chatbot Endpoint
app.post('/chatbot', async (req, res) => {
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
    const shape = shapeFromMessage(message);
    if (shape) {
      const { type, dimensions } = shape;
      let area = 0;
      if (type === 'rectangle') {
        area = rectangleArea(dimensions.length, dimensions.width);
      } else if (type === 'circle') {
        area = circleArea(dimensions.radius);
      } else if (type === 'triangle') {
        area = triangleArea(dimensions.base, dimensions.height);
      }
      return res.json({ response: `The ${type} area is ${area.toFixed(2)}.` });
    }
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
});

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
  extractNumbers,
};
