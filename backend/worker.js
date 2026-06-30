const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');
const { startEscalationScheduler } = require('./src/modules/escalation/escalation.scheduler');

/**
 * Entry point for the `sachivalayam-worker` Render service (Section 13.1
 * of the approved architecture). This process has no public HTTP
 * endpoint - it exists purely to run the escalation scheduler (and, as
 * the notification-dispatch queue grows, would also consume that queue
 * here). It connects to the SAME MongoDB database as the API service but
 * runs as an entirely independent, horizontally-scalable process.
 */
async function startWorker() {
  try {
    await connectDB();
    logger.info('Sachivalayam Worker connected to MongoDB', { env: env.NODE_ENV });

    startEscalationScheduler();

    logger.info('Sachivalayam Worker is running');
  } catch (err) {
    logger.error('Failed to start worker', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`Worker received ${signal}, shutting down gracefully`);
  await disconnectDB();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Worker: unhandled promise rejection', { reason: reason && reason.message ? reason.message : reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Worker: uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

startWorker();
