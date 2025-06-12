require('dotenv').config();
console.log("Loaded API Key:", process.env.OPENAI_API_KEY);

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

app.use(express.static(path.join(__dirname)));

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

    const numberPattern = /\d+(\.\d+)?/g;
    const matches = text.match(numberPattern);
    if (!matches || matches.length < 6) {
      return res.status(400).json({
        error: 'Not enough numbers detected. Please ensure your measurements are clearly labeled and the photo is clear.'
      });
    }
    const totalNumbers = matches.map(Number);
    const midpoint = totalNumbers.length / 2;
    const outerPoints = [];
    for (let i = 0; i < midpoint; i += 2) {
      outerPoints.push({ x: totalNumbers[i], y: totalNumbers[i + 1] });
    }
    const poolPoints = [];
    for (let i = midpoint; i < totalNumbers.length; i += 2) {
      poolPoints.push({ x: totalNumbers[i], y: totalNumbers[i + 1] });
    }
    const outerArea = polygonArea(outerPoints);
    const poolArea = polygonArea(poolPoints);
    const deckArea = outerArea - poolArea;
    const railingFootage = calculatePerimeter(outerPoints);
    const fasciaBoardLength = railingFootage;

    res.json({
      outerDeckArea: outerArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: deckArea.toFixed(2),
      railingFootage: railingFootage.toFixed(2),
      fasciaBoardLength: fasciaBoardLength.toFixed(2)
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

app.listen(port, () => {
  console.log(`Decking Chatbot with Enhanced Calculation Guide running at http://localhost:${port}`);
});
