const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const routes = require('./routes');
const config = require('./config');
const path = require('path');

const app = express();

const cspDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
cspDirectives['img-src'] = ["'self'", 'data:', 'blob:'];
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    }
  })
);
app.use(cors());
app.use(compression());
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname)));
app.use('/', routes);

app.use((err, _req, res, _next) => {
  logger.error(err.stack);
  res.status(500).json({ error: err.userMessage || 'Internal server error' });
});

module.exports = { app, logger };
