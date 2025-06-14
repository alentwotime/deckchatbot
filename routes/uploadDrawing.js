const express = require('express');
const multer = require('multer');
const { uploadDrawing } = require('../controllers/drawingUploadController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), uploadDrawing);

module.exports = router;
