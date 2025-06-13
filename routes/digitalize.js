const express = require('express');
const multer = require('multer');
const { digitalizeDrawing } = require('../controllers/digitalizeController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post('/', upload.single('image'), digitalizeDrawing);

module.exports = router;
