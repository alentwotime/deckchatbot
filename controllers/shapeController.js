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
            const missingDims = [];
            if (typeof length !== 'number') {
              missingDims.push('length');
            }
            if (typeof width !== 'number') {
              missingDims.push('width');
            }
            if (missingDims.length > 0) {
              throw new Error(`Missing rectangle dimension(s): ${missingDims.join(', ')}`);
            }
        case 'circle': {
          const { radius } = dimensions;
          if (typeof radius !== 'number' || isNaN(radius)) {
            throw new Error('Missing or invalid radius for circle');
          }
          const area = Math.PI * radius * radius;
          totalArea += area; // add circle area to totalArea
          poolArea += area; // count circles as pool
          break;
        }
          break;
        default:
          throw new Error(`Unsupported shape type: ${type}`);
      }
          break;

    // Calculate usable and adjusted deck area
    const usableArea = totalArea - poolArea;
    const adjustedArea = usableArea * (1 + wastagePercent / 100);

    const response = {
      totalShapeArea: Number(totalArea.toFixed(2)),
      poolArea: Number(poolArea.toFixed(2)),
      usableDeckArea: Number(usableArea.toFixed(2)),
      adjustedDeckArea: Number(adjustedArea.toFixed(2)),
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

  } catch (err) {
    return res.status(400).json({ errors: [{ msg: err.message || 'Invalid shape input' }] });
  }
};
