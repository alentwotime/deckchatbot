const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { digitalizeDrawing } = require('../controllers/digitalizeController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const validate = [
  body('image').custom((_, { req }) => {
    if (!req.file) {
      throw new Error('Image file is required');
    }
    return true;
  })
];
router.post('/', upload.single('image'), validate, digitalizeDrawing);

module.exports = router;
