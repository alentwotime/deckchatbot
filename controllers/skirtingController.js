function toFeetDecimal(feet, inches) {
  return parseFloat(feet) + parseFloat(inches || 0) / 12;
}

function ftIn(val) {
  const ft = Math.floor(val);
  const inches = Math.round((val - ft) * 12);
  return `${ft}' ${inches}"`;
}

function calculateSkirting(req, res) {
  const {
    lengthFt,
    lengthIn = 0,
    widthFt,
    widthIn = 0,
    heightFt,
    heightIn = 0,
    sides = 4,
    material
  } = req.body;

  if (
    lengthFt == null ||
    widthFt == null ||
    heightFt == null ||
    !material ||
    ![3, 4].includes(Number(sides))
  ) {
    return res.status(400).json({
      errors: [{ msg: 'lengthFt, widthFt, heightFt, sides (3 or 4) and material are required' }]
    });
  }

  const length = toFeetDecimal(lengthFt, lengthIn);
  const width = toFeetDecimal(widthFt, widthIn);
  const height = toFeetDecimal(heightFt, heightIn);

  const perimeter =
    Number(sides) === 4 ? 2 * (length + width) : 2 * width + length;
  const skirtingArea = perimeter * height;
  const panelsNeeded = Math.ceil(skirtingArea / 32);

  let note = '';
  if (material === 'Composite') {
    note = 'Composite skirting is durable but heavier — framing may be required.';
  } else if (material === 'PVC') {
    note = 'PVC skirting is lightweight and rot-proof, ideal for wet areas.';
  } else if (material === 'Mineral Board') {
    note = 'Mineral Board is highly fire- and insect-resistant, great for premium projects.';
  }

  res.json({
    perimeter: ftIn(perimeter),
    skirtingArea: skirtingArea.toFixed(2),
    panelsNeeded,
    material,
    tip: 'Always round up and order 1–2 extra panels for cutting and waste.',
    note
  });
}

module.exports = { calculateSkirting };
