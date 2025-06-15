const fs = require('fs');

/**
 * Deletes the specified temporary file asynchronously.
 * @param {string} filePath - The path to the temporary file to delete.
 */
function cleanTempFile(filePath) {
  fs.unlink(filePath, err => {
    if (err) {
      console.error(`Failed to delete temp file ${filePath}: ${err.message}`);
    }
  });
}

module.exports = { cleanTempFile };

