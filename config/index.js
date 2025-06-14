require('dotenv').config();

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

module.exports = {
  PORT,
  LOG_LEVEL,
  OPENAI_API_KEY,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX
};
