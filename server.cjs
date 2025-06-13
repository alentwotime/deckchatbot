@@ -17,216 +17,138 @@ const math = require('mathjs');
const Jimp = require('jimp');
const potrace = require('potrace');
const os = require('os');
const { addMessage, getRecentMessages } = require('./memory');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logDir, 'app.log') })
  ]
});

const app = express();
 codex/suggest-improvements-for-bot-logic
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const port = process.env.PORT || 3000;
=======
const port = 3000;
 main

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

function rectangleArea(length, width) {
  return length * width;
}

function circleArea(radius) {
  return Math.PI * Math.pow(radius, 2);
}

function triangleArea(base, height) {
 codex/suggest-improvements-for-bot-logic
  return (base * height) / 2;
=======
  return 0.5 * base * height;
 main
}

function polygonArea(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function calculatePerimeter(points) {
  let perimeter = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    perimeter += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  return perimeter;
}

function evaluateExpression(text) {
  try {
    const result = math.evaluate(text);
    if (typeof result !== 'function' && result !== undefined) {
      return result.toString();
    }
  } catch (e) {}
  return null;
}

function shapeFromMessage(message) {
 codex/suggest-improvements-for-bot-logic
  const numUnit = '(\\d+(?:\\.\\d+)?)\\s*(?:ft|feet|in|inches|m|meters)?';
  const rectRegex = new RegExp(`rectangle\\s*${numUnit}\\s*(?:x|by|\\*)\\s*${numUnit}`, 'i');
  const rectMatch = rectRegex.exec(message);
  if (rectMatch) {
    return { type: 'rectangle', dimensions: { length: parseFloat(rectMatch[1]), width: parseFloat(rectMatch[2]) } };
  }

  const circleRegex = new RegExp(`circle\\s*radius\\s*${numUnit}`, 'i');
  const circleMatch = circleRegex.exec(message);
  if (circleMatch) {
    return { type: 'circle', dimensions: { radius: parseFloat(circleMatch[1]) } };
  }

  const triRegex = new RegExp(`triangle\\s*${numUnit}\\s*(?:x|by|\\*)\\s*${numUnit}`, 'i');
  const triMatch = triRegex.exec(message);
  if (triMatch) {
    return { type: 'triangle', dimensions: { base: parseFloat(triMatch[1]), height: parseFloat(triMatch[2]) } };
  }

  const trapRegex = /trapezoid.*?(\\d+(?:\\.\\d+)?).*?(\\d+(?:\\.\\d+)?).*?height\\s*(\\d+(?:\\.\\d+)?)/i;
  const trapMatch = trapRegex.exec(message);
  if (trapMatch) {
    return { type: 'trapezoid', dimensions: { base1: parseFloat(trapMatch[1]), base2: parseFloat(trapMatch[2]), height: parseFloat(trapMatch[3]) } };
  }

  const doc = nlp(message);
  const numbers = doc.numbers().toNumber().out('array');
  if (/rectangle/i.test(message) && numbers.length >= 2) {
    return { type: 'rectangle', dimensions: { length: numbers[0], width: numbers[1] } };
  }
  if (/circle/i.test(message) && numbers.length >= 1) {
    return { type: 'circle', dimensions: { radius: numbers[0] } };
  }
  if (/triangle/i.test(message) && numbers.length >= 2) {
    return { type: 'triangle', dimensions: { base: numbers[0], height: numbers[1] } };
  }
  return null;
}

function formatShapeResponse(message) {
  const shape = shapeFromMessage(message);
  if (!shape) return null;
  const { type, dimensions } = shape;
  if (type === 'rectangle') {
    const area = rectangleArea(dimensions.length, dimensions.width).toFixed(2);
    const peri = (2 * (dimensions.length + dimensions.width)).toFixed(2);
    return `Rectangle area: ${area} sq ft, perimeter: ${peri} ft`;
  }
  if (type === 'triangle') {
    const area = triangleArea(dimensions.base, dimensions.height).toFixed(2);
    return `Triangle area: ${area} sq ft`;
  }
  if (type === 'circle') {
    const area = circleArea(dimensions.radius).toFixed(2);
    const circ = (2 * Math.PI * dimensions.radius).toFixed(2);
    return `Circle area: ${area} sq ft, circumference: ${circ} ft`;
  }
  if (type === 'trapezoid') {
    const { base1, base2, height } = dimensions;
    const area = (0.5 * (base1 + base2) * height).toFixed(2);
    return `Trapezoid area: ${area} sq ft`;
=======
  const text = message.toLowerCase();
  let m = text.match(/rectangle\s*(\d+(?:\.\d+)?)\s*(?:x|by|\*)\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return { type: 'rectangle', dimensions: { length: parseFloat(m[1]), width: parseFloat(m[2]) } };
  }
  m = text.match(/circle.*?radius\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return { type: 'circle', dimensions: { radius: parseFloat(m[1]) } };
  }
  m = text.match(/triangle\s*(\d+(?:\.\d+)?)\s*(?:x|by|\*)\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return { type: 'triangle', dimensions: { base: parseFloat(m[1]), height: parseFloat(m[2]) } };
  }
  m = text.match(/trapezoid.*?(\d+(?:\.\d+)?).*?(\d+(?:\.\d+)?).*?height\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return {
      type: 'trapezoid',
      dimensions: { base1: parseFloat(m[1]), base2: parseFloat(m[2]), height: parseFloat(m[3]) }
    };
 main
  }
  return null;
}

function deckAreaExplanation({ hasCutout, hasMultipleShapes }) {
  let explanation =
    'When we calculate square footage, we only include the usable surface area of the deck. For example, if a pool or other structure cuts into the deck, we subtract that inner area from the total.';
  if (!hasMultipleShapes && !hasCutout) {
    explanation += ' This is a simple deck with no cutouts. The entire area is considered usable.';
  } else if (hasCutout) {
 codex/suggest-improvements-for-bot-logic
    explanation += ' This deck has a cutout — we subtract the inner shape from the total area to get the usable surface.';
=======
    explanation += ' This deck has a cutout — we subtract the inner shape (like a pool or opening) from the total area to get the usable surface.';
 main
  } else {
    explanation += " You're working with a composite deck: a larger base shape with one or more cutouts. We subtract the inner areas from the outer to find your net square footage.";
  }
  return explanation;
}

function extractNumbers(rawText) {
  if (!rawText) return [];
  const cleaned = rawText.replace(/["'″’]/g, '');
  const numberPattern = /\d+(?:\.\d+)?/g;
  const matches = cleaned.match(numberPattern);
  if (!matches) return [];
  return matches.map(Number).filter(n => n <= 500);
}

app.use(express.static(path.join(__dirname)));

app.post(
  '/calculate-multi-shape',
  [
    body('shapes').isArray({ min: 1 }).withMessage('shapes must be a non-empty array'),
    body('shapes.*.type').isString().withMessage('shape type required'),
    body('wastagePercent').optional().isNumeric().withMessage('wastagePercent must be numeric')
  ],
  (req, res) => {
@@ -252,124 +174,50 @@ app.post(
      return res.status(400).json({ error: `Unsupported shape type: ${type}` });
    }
    if (isPool) {
      poolArea += area;
    } else {
      totalArea += area;
    }
  }
    const deckArea = totalArea - poolArea;
    const adjustedDeckArea = deckArea * (1 + wastagePercent / 100);
    const explanation = deckAreaExplanation({
      hasCutout: shapes.some(s => s.isPool),
      hasMultipleShapes: shapes.length > 1
    });
    res.json({
      totalShapeArea: totalArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: deckArea.toFixed(2),
      adjustedDeckArea: adjustedDeckArea.toFixed(2),
      note: wastagePercent ? `Adjusted for ${wastagePercent}% wastage.` : 'No wastage adjustment.',
      explanation
    });
  }
);

 codex/suggest-improvements-for-bot-logic
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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        data: { text }
      } = await Tesseract.recognize(req.file.buffer, 'eng', {
        tessedit_pageseg_mode: 6,
        tessedit_char_whitelist: '0123456789.',
        logger: info => logger.debug(info)
      });
      logger.debug(`OCR Output: ${text}`);
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
      const poolAreaValue = hasPool ? polygonArea(poolPoints) : 0;
      const deckArea = outerArea - poolAreaValue;
      const railingFootage = calculatePerimeter(outerPoints);
      const fasciaBoardLength = railingFootage;

      const warning = deckArea > 1000 ? 'Deck area exceeds 1000 sq ft. Please verify measurements.' : null;

      const explanation = deckAreaExplanation({
        hasCutout: poolAreaValue > 0,
        hasMultipleShapes: poolAreaValue > 0
      });

      res.json({
        outerDeckArea: outerArea.toFixed(2),
        poolArea: poolAreaValue.toFixed(2),
        usableDeckArea: deckArea.toFixed(2),
        railingFootage: railingFootage.toFixed(2),
        fasciaBoardLength: fasciaBoardLength.toFixed(2),
        warning,
        explanation
      });
    } catch (err) {
      logger.error(err.stack);
      res.status(500).json({ error: 'Error processing image.' });
    }
  }
);
=======
app.post('/upload-measurements', upload.single('image'), [
  body('image').custom((_, { req }) => {
    if (!req.file) {
      throw new Error('Image file is required');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
      tessedit_pageseg_mode: 6,
      tessedit_char_whitelist: '0123456789.',
      logger: info => logger.debug(info)
    });
    const numbers = extractNumbers(text);
    if (numbers.length < 6) {
      return res.status(400).json({
        error: 'Not enough numbers detected. Please ensure your measurements are clearly labeled and the photo is clear.'
      });
    }
    const hasPool = /pool/i.test(text);
@@ -389,197 +237,158 @@ app.post('/upload-measurements', upload.single('image'), [
    const deckArea = outerArea - poolArea;
    const railingFootage = calculatePerimeter(outerPoints);
    const fasciaBoardLength = railingFootage;

    const warning = deckArea > 1000 ? 'Deck area exceeds 1000 sq ft. Please verify measurements.' : null;

    const explanation = deckAreaExplanation({
      hasCutout: poolArea > 0,
      hasMultipleShapes: poolArea > 0
    });

    res.json({
      outerDeckArea: outerArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: deckArea.toFixed(2),
      railingFootage: railingFootage.toFixed(2),
      fasciaBoardLength: fasciaBoardLength.toFixed(2),
      warning,
      explanation
    });
  } catch (err) {
    logger.error(err.stack);
    res.status(500).json({ error: 'Error processing image.' });
  }
});
 main

app.post('/digitalize-drawing', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image.' });
    }
    const img = await Jimp.read(req.file.buffer);
    img.greyscale().contrast(1).normalize().threshold({ max: 200 });
 codex/suggest-improvements-for-bot-logic
    const buffer = await new Promise((resolve, reject) => {
      img.getBuffer('image/png', (err, data) => {
        if (err) return reject(err);
        resolve(data);
=======

    const buffer = await new Promise((resolve, reject) => {
      img.getBuffer('image/png', (err, buf) => {
        if (err) return reject(err);
        resolve(buf);
 main
      });
    });
    const tmpPath = path.join(os.tmpdir(), `drawing-${Date.now()}.png`);
    await fs.promises.writeFile(tmpPath, buffer);
    const svg = await new Promise((resolve, reject) => {
      potrace.trace(tmpPath, { threshold: 180, turdSize: 2 }, (err, out) => {
        fs.unlink(tmpPath, () => {});
        if (err) return reject(new Error('digitalize'));
        resolve(out);
      });
    });
 codex/suggest-improvements-for-bot-logic

    const {
      data: { text }
    } = await Tesseract.recognize(buffer, 'eng', {
      tessedit_pageseg_mode: 6,
      tessedit_char_whitelist: '0123456789.',
      logger: info => logger.debug(info)
    });
    const numbers = extractNumbers(text);
    const points = [];
    for (let i = 0; i < numbers.length; i += 2) {
      if (numbers[i + 1] !== undefined) {
        points.push({ x: numbers[i], y: numbers[i + 1] });
      }
    let ocrText = '';
    try {
      const {
        data: { text }
      } = await Tesseract.recognize(buffer, 'eng', {
        tessedit_pageseg_mode: 6,
        tessedit_char_whitelist: '0123456789.',
        logger: info => logger.debug(info)
      });
      ocrText = text;
    } catch (ocrErr) {
      logger.error(ocrErr);
    }

    let area = null;
    let perimeter = null;
    if (points.length >= 3) {
      area = polygonArea(points);
      perimeter = calculatePerimeter(points);
    if (ocrText) {
      const numbers = extractNumbers(ocrText);
      const points = [];
      for (let i = 0; i < numbers.length; i += 2) {
        if (numbers[i + 1] !== undefined) {
          points.push({ x: numbers[i], y: numbers[i + 1] });
        }
      }
      if (points.length >= 3) {
        area = polygonArea(points);
        perimeter = calculatePerimeter(points);
      }
    }

=======
 main
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    logger.error(err.stack);
 codex/suggest-improvements-for-bot-logic
    res.status(500).json({ error: 'Error digitalizing drawing.' });
=======
    if (err.message === 'digitalize') {
      res.status(500).json({ error: 'Error digitalizing drawing.' });
    } else {
      res.status(500).json({ error: 'Error processing drawing.' });
    }
 main
  }
});

app.post(
  '/chatbot',
  [body('message').exists({ checkFalsy: true }).withMessage('message is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { message } = req.body;
 codex/suggest-improvements-for-bot-logic

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
      const hasCutout = /pool|cutout/i.test(message);
      const explanation = deckAreaExplanation({
        hasCutout,
        hasMultipleShapes: hasCutout
      });
      const reply = `The ${type} area is ${area.toFixed(2)}. ${explanation}`;
      addMessage('assistant', reply);
      return res.json({ response: reply });
    }
    const mathAnswer = evaluateExpression(message);
    if (mathAnswer !== null) {
      return res.json({ response: `Result: ${mathAnswer}` });
    }

    const calculationGuide = `Here’s a detailed guide for calculating square footage and other shapes:\n1. Rectangle: L × W\n2. Triangle: (1/2) × Base × Height\n3. Circle: π × Radius²\n4. Half Circle: (1/2) π × Radius²\n5. Quarter Circle: (1/4) π × Radius²\n6. Trapezoid: (1/2) × (Base1 + Base2) × Height\n7. Complex Shapes: sum of all simpler shapes’ areas.\n8. Fascia Board: total perimeter length (excluding steps).`;

    try {
      addMessage('user', message);
=======
    const calculationGuide = `Here’s a detailed guide for calculating square footage and other shapes:\n1. Rectangle: L × W\n2. Triangle: (1/2) × Base × Height\n3. Circle: π × Radius²\n4. Half Circle: (1/2) × π × Radius²\n5. Quarter Circle: (1/4) × π × Radius²\n6. Trapezoid: (1/2) × (Base1 + Base2) × Height\n7. Complex Shapes: sum of all simpler shapes’ areas.\n8. Fascia Board: total perimeter length (excluding steps).`;
    try {
      addMessage('user', message);
      const shape = shapeFromMessage(message);
      if (shape) {
        const { type, dimensions } = shape;
        let area = 0;
        let perimeter = null;
        if (type === 'rectangle') {
          area = rectangleArea(dimensions.length, dimensions.width);
          perimeter = 2 * (dimensions.length + dimensions.width);
        } else if (type === 'circle') {
          area = circleArea(dimensions.radius);
          perimeter = 2 * Math.PI * dimensions.radius;
        } else if (type === 'triangle') {
          area = triangleArea(dimensions.base, dimensions.height);
        } else if (type === 'trapezoid') {
          area = 0.5 * (dimensions.base1 + dimensions.base2) * dimensions.height;
        }
        const hasCutout = /pool|cutout/i.test(message);
        const explanation = deckAreaExplanation({
          hasCutout,
          hasMultipleShapes: hasCutout
        });
        let reply = `The ${type} area is ${area.toFixed(2)}.`;
        if (perimeter !== null) {
          reply += ` Perimeter is ${perimeter.toFixed(2)}.`;
        }
        reply += ` ${explanation}`;
        addMessage('assistant', reply);
        return res.json({ response: reply });
      }
 main
      const history = getRecentMessages();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are a smart math bot using this calculation guide:\n${calculationGuide}\nAlways form follow-up questions if needed to clarify user data.` },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      });
      const botReply = completion.choices[0].message.content;
      addMessage('assistant', botReply);
      res.json({ response: botReply });
    } catch (err) {
      err.userMessage = 'Error communicating with OpenAI.';
      next(err);
    }
  }
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, _req, res, _next) => {
  logger.error(err.stack);