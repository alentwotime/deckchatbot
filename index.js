const cluster = require('cluster');
const os = require('os');
const { app, logger } = require('./server.cjs');
const config = require('./config');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(config.PORT, () => {
    logger.info(`Worker ${process.pid} running on port ${config.PORT}`);
  });
}
