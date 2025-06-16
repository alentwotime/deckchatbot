const { body, validationResult } = require('express-validator');
const { addMessage, getRecentMessages } = require('../memory');
const {
  rectangleArea,
  circleArea,
  triangleArea,
  shapeFromMessage,
  deckAreaExplanation
} = require('../utils/geometry');
const config = require('../config');
const logger = require('../utils/logger');
const { askChat } = require('../services/openai.service');

const validate = [body('message').exists({ checkFalsy: true }).withMessage('message is required')];

async function chatbot(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { message } = req.body;
  const calculationGuide = `Here’s a detailed guide for calculating square footage and other shapes:\n1. Rectangle: L × W\n2. Triangle: (1/2) × Base × Height\n3. Circle: π × Radius²\n4. Half Circle: (1/2) × π × Radius²\n5. Quarter Circle: (1/4) × π × Radius²\n6. Trapezoid: (1/2) × (Base1 + Base2) × Height\n7. Complex Shapes: sum of all simpler shapes’ areas.\n8. Fascia Board: total perimeter length (excluding steps).`;
  try {
    await addMessage('user', message);
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
      await addMessage('assistant', reply);
      return res.json({ response: reply });
    }
    const history = getRecentMessages();
    const botReply = await askChat([
      { role: 'system', content: `You are a smart math bot using this calculation guide:\n${calculationGuide}\nAlways form follow-up questions if needed to clarify user data.` },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]);
    await addMessage('assistant', botReply);
    res.json({ response: botReply });
  } catch (err) {
    logger.error(err.stack);
    err.userMessage = 'Error communicating with OpenAI.';
    next(err);
  }
}

module.exports = { chatbot, validate };
