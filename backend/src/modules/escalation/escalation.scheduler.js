const cron = require('node-cron');
const env = require('../../config/env');
const escalationService = require('./escalation.service');
const logger = require('../../utils/logger');

let isRunning = false;

/**
 * Schedules the escalation sweep on the cron expression configured via
 * ESCALATION_SCHEDULER_CRON (default every 15 minutes). Guards against
 * overlapping runs with isRunning, since a slow sweep (large complaint
 * volume) should never stack a second sweep on top of itself.
 */
function startEscalationScheduler() {
  cron.schedule(env.ESCALATION_SCHEDULER_CRON, async () => {
    if (isRunning) {
      logger.warn('Escalation sweep skipped - previous sweep still running');
      return;
    }
    isRunning = true;
    try {
      await escalationService.runEscalationSweep();
    } catch (err) {
      logger.error('Escalation sweep failed', { error: err.message, stack: err.stack });
    } finally {
      isRunning = false;
    }
  });

  logger.info('Escalation scheduler started', { cron: env.ESCALATION_SCHEDULER_CRON });
}

module.exports = { startEscalationScheduler };
