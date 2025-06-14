const express = require('express');
const multer = require('multer');
const { uploadMeasurements } = require('../controllers/measurementController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Just check file in the controller instead
router.post('/', upload.single('image'), uploadMeasurements);

module.exports = router;
