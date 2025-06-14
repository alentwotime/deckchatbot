function extractNumbers(rawText) {
  if (!rawText) {
    return [];
  }
  const cleaned = rawText.replace(/["'″’]/g, '');
  const numberPattern = /\d+(?:\.\d+)?/g;
  const matches = cleaned.match(numberPattern);
  if (!matches) {
    return [];
  }
  return matches.map(Number).filter(n => n <= 500);
}

module.exports = { extractNumbers };
