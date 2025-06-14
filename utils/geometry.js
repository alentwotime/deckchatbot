const math = require('mathjs');

function rectangleArea(length, width) {
  return length * width;
}

function circleArea(radius) {
  return Math.PI * Math.pow(radius, 2);
}

function triangleArea(base, height) {
  return 0.5 * base * height;
}

function polygonArea(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function calculatePerimeter(points) {
  let perimeter = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    perimeter += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  return perimeter;
}

function evaluateExpression(text) {
  try {
    const result = math.evaluate(text);
    if (typeof result !== 'function' && result !== undefined) {
      return result.toString();
    }
  } catch (e) {}
  return null;
}

function shapeFromMessage(message) {
  const text = message.toLowerCase();
  let m = text.match(/rectangle\s*(\d+(?:\.\d+)?)\s*(?:x|by|\*)\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return { type: 'rectangle', dimensions: { length: parseFloat(m[1]), width: parseFloat(m[2]) } };
  }
  m = text.match(/circle.*?radius\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return { type: 'circle', dimensions: { radius: parseFloat(m[1]) } };
  }
  m = text.match(/triangle\s*(\d+(?:\.\d+)?)\s*(?:x|by|\*)\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return { type: 'triangle', dimensions: { base: parseFloat(m[1]), height: parseFloat(m[2]) } };
  }
  m = text.match(/trapezoid.*?(\d+(?:\.\d+)?).*?(\d+(?:\.\d+)?).*?height\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return {
      type: 'trapezoid',
      dimensions: { base1: parseFloat(m[1]), base2: parseFloat(m[2]), height: parseFloat(m[3]) }
    };
  }
  return null;
}

function deckAreaExplanation({ hasCutout, hasMultipleShapes }) {
  let explanation =
    'When we calculate square footage, we only include the usable surface area of the deck. For example, if a pool or other structure cuts into the deck, we subtract that inner area from the total.';
  if (!hasMultipleShapes && !hasCutout) {
    explanation += ' This is a simple deck with no cutouts. The entire area is considered usable.';
  } else if (hasCutout) {
    explanation += ' This deck has a cutout \u2014 we subtract the inner shape (like a pool or opening) from the total area to get the usable surface.';
  } else {
    explanation += " You're working with a composite deck: a larger base shape with one or more cutouts. We subtract the inner areas from the outer to find your net square footage.";
  }
  return explanation;
}

module.exports = {
  rectangleArea,
  circleArea,
  triangleArea,
  polygonArea,
  calculatePerimeter,
  evaluateExpression,
  shapeFromMessage,
  deckAreaExplanation
};
