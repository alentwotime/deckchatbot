const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const routes = require('./routes');
const logger = require('./utils/logger');

if (!config.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. Create a .env file with your key.');
}


const app = express();

app.use(helmet());
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use('/', routes);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ error: err.userMessage || 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    logger.info(`Decking Chatbot running at http://localhost:${config.PORT}`);
  });
}

module.exports = { app, logger };

