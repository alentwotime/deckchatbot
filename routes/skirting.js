const express = require('express');
const { calculateSkirting } = require('../controllers/skirtingController');

const router = express.Router();

router.post('/', calculateSkirting);

module.exports = router;
