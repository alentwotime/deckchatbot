const path = require('path');
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let metaString = '';
      if (Object.keys(meta).length > 0) {
        metaString = ' ' + JSON.stringify(meta, null, 2);
      }
      return `${timestamp} [${level}]: ${message}${metaString}`;
    }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

module.exports = logger;

