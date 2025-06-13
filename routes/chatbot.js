const express = require('express');
const { chatbot, validate } = require('../controllers/chatbotController');

const router = express.Router();
router.post('/', validate, chatbot);

module.exports = router;
