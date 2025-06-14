require('dotenv').config();

module.exports = {
 codex/expand-chat-container-responsiveness
  PORT,
  LOG_LEVEL,
  OPENAI_API_KEY: OPENAI_API_KEY || '',
=======
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
 main
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
};
