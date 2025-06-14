const cluster = require('cluster');
const os = require('os');
const { app, logger } = require('./server.cjs');
const config = require('./config');

const PORT = config.PORT || 3000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`🧠 Primary process started. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    logger.info(`✅ Worker ${process.pid} running at http://localhost:${PORT}`);
  });
}
