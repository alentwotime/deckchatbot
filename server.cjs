app.post('/digitalize-drawing', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image.' });
    }
    const img = await Jimp.read(req.file.buffer);
    img.greyscale().contrast(1).normalize().threshold({ max: 200 });

    const buffer = await new Promise((resolve, reject) => {
      img.getBuffer('image/png', (err, data) => {
        if (err) return reject(err);
        resolve(data);
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
    }
    let area = null;
    let perimeter = null;
    if (points.length >= 3) {
      area = polygonArea(points);
      perimeter = calculatePerimeter(points);
    }

    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    logger.error(err.stack);
    if (err.message === 'digitalize') {
      res.status(500).json({ error: 'Error digitalizing drawing.' });
    } else {
      res.status(500).json({ error: 'Error processing drawing.' });
    }
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
  res.status(err.status || 500).json({ error: err.userMessage || 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Decking Chatbot with Enhanced Calculation Guide running at http://localhost:${port}`);
  });
}

module.exports = {
  app,
  rectangleArea,
  circleArea,
  triangleArea,
  polygonArea,
  shapeFromMessage,
  deckAreaExplanation,
  extractNumbers
};
