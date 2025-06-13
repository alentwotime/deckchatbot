const { app, logger } = require('./server.cjs');
const config = require('./config');

app.listen(config.PORT, () => {
  logger.info(`Decking Chatbot running at http://localhost:${config.PORT}`);
});
