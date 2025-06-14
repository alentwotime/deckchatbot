require('dotenv').config();

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY && process.env.NODE_ENV !== 'test') {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

module.exports = {
 codex/add-rate-limiting-middleware
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
=======
  PORT,
  LOG_LEVEL,
  OPENAI_API_KEY: OPENAI_API_KEY || ''
 main
};
