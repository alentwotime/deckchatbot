const express = require('express');
const chatbot = require('./chatbot');
const digitalize = require('./digitalize');
const measurements = require('./measurements');
const multishape = require('./multishape');

const router = express.Router();

router.use('/chatbot', chatbot);
router.use('/digitalize-drawing', digitalize);
router.use('/upload-measurements', measurements);
router.use('/calculate-multi-shape', multishape);

module.exports = router;
