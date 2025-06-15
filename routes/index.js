const express = require('express');
const router = express.Router();

// 📦 Route Modules
const chatbotRoutes = require('./chatbot');
const digitalizeRoutes = require('./digitalize'); // if needed for GETs or middleware-wrapped POST
const measurementRoutes = require('./measurements');
const multishapeRoutes = require('./multishape');
const deckCalcRoutes = require('./deckCalc');
const skirtingRoutes = require('./skirting');
const uploadDrawingRoutes = require('./uploadDrawing');

// 🧠 Route Mounting
router.use('/chatbot', chatbotRoutes);
router.use('/digitalize-drawing', digitalizeRoutes); // Optional: keep if you modularize upload middleware
router.use('/upload-measurements', measurementRoutes);
router.use('/calculate-multi-shape', multishapeRoutes);
router.use('/calculate-deck', deckCalcRoutes);
router.use('/calculate-skirting', skirtingRoutes);
router.use('/upload-drawing', uploadDrawingRoutes);

module.exports = router;
