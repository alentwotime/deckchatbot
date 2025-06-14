const { rectangleArea, circleArea, triangleArea, polygonArea, deckAreaExplanation } = require('../utils/geometry');

function calculateMultiShape(req, res) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { shapes, wastagePercent = 0 } = req.body;
  let totalArea = 0;
  let poolArea = 0;
  for (const shape of shapes) {
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

module.exports = { calculateMultiShape };
