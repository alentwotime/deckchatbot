const express = require('express');
const { calculateDeckMaterials } = require('../controllers/deckCalcController');

const router = express.Router();

router.post('/', calculateDeckMaterials);

module.exports = router;
