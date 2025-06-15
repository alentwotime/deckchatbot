const { deckAreaExplanation } = require('../utils/geometry');

exports.calculateMultiShape = (req, res) => {
  const { shapes, wastagePercent = 0, label } = req.body;

  if (!Array.isArray(shapes) || shapes.length === 0) {
    return res.status(400).json({ errors: [{ msg: 'shapes must be a non-empty array' }] });
  }

  let totalArea = 0;
  let poolArea = 0;

  try {
    shapes.forEach((shape, index) => {
      if (!shape.type || !shape.dimensions) {
        throw new Error(`Missing shape type or dimensions for shape ${index + 1}`);
      }

      const { type, dimensions, isPool = false } = shape;

      switch (type.toLowerCase()) {
        case 'rectangle': {
          const { length, width } = dimensions;
          if (typeof length !== 'number' || typeof width !== 'number') {
            throw new Error(`Invalid rectangle dimensions for shape ${index + 1}: length and width must be numbers`);
          }
          const area = length * width;
          totalArea += area;
          if (isPool) {
            poolArea += area;
          }
          break;
        }
        case 'circle': {
          const { radius } = dimensions;
          if (typeof radius !== 'number' || isNaN(radius)) {
            throw new Error(`Invalid circle dimensions for shape ${index + 1}: radius must be a number`);
          }
          const area = Math.PI * radius * radius;
          totalArea += area;
          if (isPool) {
            poolArea += area;
          }
          break;
        }
        case 'lshape': {
          const { length1, width1, length2, width2 } = dimensions;
          if (typeof length1 !== 'number' || typeof width1 !== 'number' || 
              typeof length2 !== 'number' || typeof width2 !== 'number') {
            throw new Error(`Invalid L-shape dimensions for shape ${index + 1}: all dimensions must be numbers`);
          }
          const area = (length1 * width1) + (length2 * width2);
          totalArea += area;
          if (isPool) {
            poolArea += area;
          }
          break;
        }
        case 'octagon': {
          const { side } = dimensions;
          if (typeof side !== 'number' || isNaN(side)) {
            throw new Error(`Invalid octagon dimensions for shape ${index + 1}: side must be a number`);
          }
          const area = 2 * (1 + Math.sqrt(2)) * side * side;
          totalArea += area;
          if (isPool) {
            poolArea += area;
          }
          break;
        }
        default:
          throw new Error(`Unsupported shape type: ${type}`);
      }
    });

    // Calculate usable and adjusted deck area
    const usableArea = totalArea - poolArea;
    const adjustedArea = usableArea * (1 + wastagePercent / 100);

    const response = {
      totalShapeArea: totalArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: usableArea.toFixed(2),
      adjustedDeckArea: adjustedArea.toFixed(2),
      note: wastagePercent > 0 ? `Adjusted for ${wastagePercent}% wastage.` : 'No wastage adjustment applied.',
      explanation: deckAreaExplanation({
        hasCutout: poolArea > 0,
        hasMultipleShapes: shapes.length > 1
      }),
      ...(label && { projectLabel: label })
    };

    return res.json(response);

  } catch (err) {
    return res.status(400).json({ errors: [{ msg: err.message || 'Invalid shape input' }] });
  }
};
