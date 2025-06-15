const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const logger = require('../utils/logger');

async function uploadDrawing(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }

    const uploadDir = path.join(__dirname, '../public/uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${req.file.originalname}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, req.file.buffer);

    // store metadata
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO upload_history (file_name, file_type) VALUES (?, ?)',
        [filename, req.file.mimetype],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve();
        }
      );
    });

    const publicUrl = `/uploads/${filename}`;
    res.json({ status: 'success', publicUrl });
  } catch (err) {
    logger.error(`Error uploading drawing: ${err.stack}`);
    res.status(500).json({ error: 'Error saving image' });
  }
}

module.exports = { uploadDrawing };
