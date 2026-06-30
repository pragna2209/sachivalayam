const { recordActivity } = require('../modules/activity/activity.service');
const logger = require('../utils/logger');

/**
 * Records a low-stakes "the user did X" event, separate from the heavier
 * audit_logs trail (Section 9.7). Usage: trackActivity('VIEWED_COMPLAINT')
 * mounted on a specific route, or with a function for dynamic action names.
 */
function trackActivity(actionOrFn) {
  return function activityMiddleware(req, res, next) {
    res.on('finish', () => {
      if (!req.user || res.statusCode >= 400) return;
      const action = typeof actionOrFn === 'function' ? actionOrFn(req) : actionOrFn;
      recordActivity({
        userId: req.user._id,
        action,
        metadata: { path: req.originalUrl, method: req.method }
      }).catch((err) => {
        logger.error('Failed to write activity log', { error: err.message, action });
      });
    });
    next();
  };
}

module.exports = trackActivity;
