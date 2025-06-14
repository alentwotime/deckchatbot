const fs = require('fs');

function cleanTempFile(filePath) {
  fs.unlink(filePath, err => {
    if (err) console.error(`Failed to delete temp file ${filePath}:`, err.message);
  });
}

module.exports = { cleanTempFile };

