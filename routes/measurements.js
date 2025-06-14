const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { uploadMeasurements } = require('../controllers/measurementController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const validate = [
  body('image').custom((_, { req }) => {
    if (!req.file) {
      throw new Error('Image file is required');
    }
    return true;
  })
];

router.post(
  '/',
  (req, res, next) => {
    upload.single('image')(req, res, err => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  validate,
  uploadMeasurements
);

module.exports = router;
