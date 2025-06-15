/**
 * Converts a decimal feet measurement to a string in feet and inches format.
 * @param {number} val - The measurement in decimal feet.
 * @returns {string} The formatted string in feet and inches (e.g., 5' 7").
 */
function ftIn(val) {
  const ft = Math.floor(val);
  const inches = Math.round((val - ft) * 12);
  return `${ft}' ${inches}"`;
}

/**
 * Calculates skirting metrics for a deck or similar structure.
 * @param {Object} options - The options for calculation.
 * @param {number} options.length - The length of the structure in feet.
 * @param {number} options.width - The width of the structure in feet (or side length for polygons).
 * @param {number} options.height - The height of the skirting in feet.
 * @param {number} [options.sides=4] - The number of sides (4 for rectangles, or number of polygon sides).
 * @param {string} options.material - The material type (e.g., 'Composite', 'PVC', 'Mineral Board').
 * @returns {Object} The calculated metrics including perimeter (feet), skirtingArea (sq ft), panelsNeeded (32 sq ft panels), material, tip, and note.
 */
function calculateSkirtingMetrics({ length, width, height, sides = 4, material }) {
  const PANEL_AREA_SQFT = 32;
  const perimeter = Number(sides) === 4
    ? 2 * (length + width)
    : 2 * width + length;
  const skirtingArea = perimeter * height;
  const panelsNeeded = Math.ceil(skirtingArea / PANEL_AREA_SQFT);
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

