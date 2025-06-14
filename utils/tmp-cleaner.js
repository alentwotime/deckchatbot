const fs = require('fs');
const path = require('path');

function cleanTmp(dir, maxAgeMs = 60 * 60 * 1000) {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > maxAgeMs) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = { cleanTmp };
