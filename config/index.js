require('dotenv').config();

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY && process.env.NODE_ENV !== 'test') {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

module.exports = {
  PORT,
  LOG_LEVEL,
  OPENAI_API_KEY: OPENAI_API_KEY || ''
};
