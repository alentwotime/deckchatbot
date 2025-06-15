const express = require('express');
const { calculateMultiShape } = require('../controllers/shapeController');

const router = express.Router();

router.post('/', calculateMultiShape);

module.exports = router;
