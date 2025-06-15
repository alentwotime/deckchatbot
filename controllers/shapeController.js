const { deckAreaExplanation } = require('../utils/geometry');

exports.calculateMultiShape = (req, res) => {
  const { shapes, wastagePercent = 0 } = req.body;

  if (!Array.isArray(shapes) || shapes.length === 0) {
    return res.status(400).json({ errors: [{ msg: 'shapes must be a non-empty array' }] });
  }

  let totalArea = 0;
  let poolArea = 0;

  try {
    shapes.forEach(shape => {
      if (!shape.type || !shape.dimensions) {
        throw new Error('Missing shape type or dimensions');
      }

      const { type, dimensions } = shape;

      switch (type.toLowerCase()) {
        case 'rectangle': {
          const { length, width, height } = dimensions;
          const vals = [length, width, height].filter(v => typeof v === 'number');
          if (vals.length < 2) {
            throw new Error('Missing shape dimensions');
          }
          totalArea += vals[0] * vals[1];
          break;
        }

        case 'circle':
          const { radius } = dimensions;
          const area = Math.PI * radius * radius;
          poolArea += area; // count circles as pool
          break;

        default:
          throw new Error('Unsupported shape type');
      }
    });

    const usableArea = totalArea - poolArea;
    const adjustedArea = usableArea * (1 + wastagePercent / 100);

    const response = {
      totalShapeArea: totalArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: usableArea.toFixed(2),
      adjustedDeckArea: adjustedArea.toFixed(2),
      note: `Adjusted for ${wastagePercent}% wastage.`,
      explanation: deckAreaExplanation({
        hasCutout: poolArea > 0,
        hasMultipleShapes: shapes.length > 1
      })
    };

    return res.json(response);

  } catch (err) {
    return res.status(400).json({ errors: [{ msg: err.message || 'Invalid shape input' }] });
  }
};
