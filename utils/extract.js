// Parse a single measurement token treating ' as feet and " as inches.
function parseMeasurement(token) {
  const t = token.trim();
  let m = t.match(/^(\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)\s*"$/); // X' Y"
  if (m) {
    return parseFloat(m[1]) + parseFloat(m[2]) / 12;
  }
  m = t.match(/^(\d+(?:\.\d+)?)\s*'$/); // X'
  if (m) {
    return parseFloat(m[1]);
  }
  m = t.match(/^(\d+(?:\.\d+)?)\s*"$/); // X"
  if (m) {
    return parseFloat(m[1]) / 12;
  }
  m = t.match(/^(\d+(?:\.\d+)?)/); // plain number
  if (m) {
    return parseFloat(m[1]);
  }
  return null;
}

function extractNumbers(rawText) {
  if (!rawText) {
    return [];
  }
  // Standardize curly quotes from OCR output
  const normalized = rawText.replace(/[’]/g, "'").replace(/[″]/g, '"');
  const pattern = /\d+(?:\.\d+)?(?:\s*'\s*\d+(?:\.\d+)?\s*\")?|\d+(?:\.\d+)?\s*'|\d+(?:\.\d+)?\s*\"|\d+(?:\.\d+)?/g;
  const matches = normalized.match(pattern);
  if (!matches) {
    return [];
  }
  return matches
    .map(parseMeasurement)
    .filter(n => typeof n === 'number' && !isNaN(n) && n <= 500);
}

module.exports = { extractNumbers, parseMeasurement };
