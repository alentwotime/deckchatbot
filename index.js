const cluster = require('cluster');
const os = require('os');
const { app, logger } = require('./server.js');
const config = require('./config');

const PORT = config.PORT ?? 3000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(
    `${config.USE_LOG_EMOJI ? '🧠 ' : ''}Primary process started. Forking ${numCPUs} workers...`
  );

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  let restartCount = 0;
  const MAX_RESTARTS = 5;
  const RESTART_DELAY_MS = 2000;

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(
      `${config.USE_LOG_EMOJI ? '💀 ' : ''}Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}).`
    );
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      logger.info(
        `${config.USE_LOG_EMOJI ? '🔄 ' : ''}Restarting worker (attempt ${restartCount}/${MAX_RESTARTS})...`
      );
      setTimeout(() => {
        cluster.fork();
      }, RESTART_DELAY_MS);
    } else {
      logger.error('🚨 Maximum worker restart limit reached. Not restarting.');
    }
  });
} else {
  app.listen(PORT, () => {
    logger.info(`✅ Worker ${process.pid} running at http://localhost:${PORT}`);
  });
}
