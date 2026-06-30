const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');
const app = require('./app');

let server;

async function start() {
  try {
    await connectDB();
    server = app.listen(env.PORT, () => {
      logger.info(`Sachivalayam API listening on port ${env.PORT}`, {
        env: env.NODE_ENV,
        basePath: env.API_BASE_PATH
      });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      logger.info('Server shut down cleanly');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason && reason.message ? reason.message : reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

start();
