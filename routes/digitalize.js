const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { digitalizeDrawing } = require('../controllers/digitalizeController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🧪 Validation: Ensure image file exists
const validateImage = [
  body('image').custom((_, { req }) => {
    if (!req.file) {
      throw new Error('Image file is required');
    }
    return true;
  })
];

// POST /digitalize-drawing
router.post('/', upload.single('image'), digitalizeDrawing);

module.exports = router;
