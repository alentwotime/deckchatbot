const express = require('express');
const { chatbot, validate, getHistory } = require('../controllers/chatbotController');

const router = express.Router();
router.post('/', validate, chatbot);
router.get('/history', getHistory);

module.exports = router;
