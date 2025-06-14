function ftIn(val) {
  const ft = Math.floor(val);
  const inches = Math.round((val - ft) * 12);
  return `${ft}' ${inches}"`;
}

function calculateSkirtingMetrics({ length, width, height, sides = 4, material }) {
  const perimeter = Number(sides) === 4 ? 2 * (length + width) : 2 * width + length;
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
  return {
    perimeter,
    skirtingArea,
    panelsNeeded,
    material,
    tip: 'Always round up and order 1–2 extra panels for cutting and waste.',
    note
  };
}

module.exports = { calculateSkirtingMetrics, ftIn };

