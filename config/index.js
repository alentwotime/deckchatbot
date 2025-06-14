require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
};
