const express = require('express');
const { body } = require('express-validator');
const { calculateMultiShape } = require('../controllers/multishapeController');

const router = express.Router();
const validate = [
  body('shapes').isArray({ min: 1 }).withMessage('shapes must be a non-empty array'),
  body('shapes.*.type').isString().withMessage('shape type required'),
  body('wastagePercent').optional().isNumeric().withMessage('wastagePercent must be numeric')
];

router.post('/', validate, calculateMultiShape);

module.exports = router;
