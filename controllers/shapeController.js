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
        case 'rectangle':
          const { width, height } = dimensions;
          totalArea += width * height;
          break;

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
    const withWastage = usableArea * (1 + wastagePercent / 100);

    return res.json({
      totalShapeArea: totalArea.toFixed(2),
      poolArea: poolArea.toFixed(2),
      usableDeckArea: withWastage.toFixed(2)
    });

  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid shape input' });
  }
};
