const {
  rectangleArea,
  circleArea,
  triangleArea,
  polygonArea,
  deckAreaExplanation
} = require('../utils/geometry');

function calculateMultiShape(req, res) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { shapes, wastagePercent = 0 } = req.body;

  // ✅ Validate that shapes is a non-empty array
  if (!Array.isArray(shapes) || shapes.length === 0) {
    return res.status(400).json({
      errors: [{ msg: 'shapes must be a non-empty array' }]
    });
  }

  let totalArea = 0;
  let poolArea = 0;

  try {
    for (const shape of shapes) {
      if (!shape || !shape.type || !shape.dimensions) {
        return res.status(400).json({
          errors: [{ msg: 'Each shape must include type and dimensions' }]
        });
      }

      const { type, dimensions, isPool } = shape;
      let area = 0;

      switch (type.toLowerCase()) {
        case 'rectangle':
          area = rectangleArea(dimensions.length, dimensions.width);
          break;
        case 'circle':
          area = circleArea(dimensions.radius);
          break;
        case 'triangle':
          area = triangleArea(dimensions.base, dimensions.height);
          break;
        case 'polygon':
          area = polygonArea(dimensions.points);
          break;
        default:
          return res.status(400).json({
            errors: [{ msg: `Unsupported shape type: ${type}` }]
          });
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

    return res.json({
      totalShapeArea: totalArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: deckArea.toFixed(2),
      adjustedDeckArea: adjustedDeckArea.toFixed(2),
      note: wastagePercent
        ? `Adjusted for ${wastagePercent}% wastage.`
        : 'No wastage adjustment.',
      explanation
    });
  } catch (err) {
    return res.status(500).json({
      errors: [{ msg: 'An error occurred during calculation.' }]
    });
  }
}

module.exports = { calculateMultiShape };
