const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const potrace = require('potrace');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { cleanTempFile } = require('../utils/tmp-cleaner');

async function digitalizeDrawing(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }

    const buffer = await sharp(req.file.buffer)
      .greyscale()
      .normalise()
      .threshold(200)
      .png()
      .toBuffer();

    const tmpPath = path.join(os.tmpdir(), `drawing-${Date.now()}.png`);
    await fs.promises.writeFile(tmpPath, buffer);

    const svg = await new Promise((resolve, reject) => {
      potrace.trace(tmpPath, { threshold: 180, turdSize: 2 }, (err, out) => {
        cleanTempFile(tmpPath);
        if (err) {
          return reject(new Error('digitalize'));
        }
        resolve(out);
      });
    });

    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    logger.error(err.stack);
    if (err.message === 'digitalize') {
      res.status(500).json({ errors: [{ msg: 'Error digitalizing drawing.' }] });
    } else {
      res.status(500).json({ errors: [{ msg: 'Error processing drawing.' }] });
    }
  }
}

module.exports = { digitalizeDrawing };
