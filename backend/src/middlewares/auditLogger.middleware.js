const { recordAuditLog } = require('../modules/audit/audit.service');
const logger = require('../utils/logger');

/**
 * Wraps a mutating route so that, after the controller successfully sets
 * res.locals.auditEntry, an audit_logs entry is written automatically once
 * the response has been sent - this keeps the audit-logging concern out of
 * every individual controller body while still giving controllers full
 * control over what beforeState/afterState/action gets recorded.
 *
 * Controllers populate res.locals.auditEntry = { action, entityType,
 * entityId, beforeState, afterState } and this middleware (mounted AFTER
 * the controller in the route chain via res.on('finish')) takes care of
 * the actual write, attaching actor identity and IP automatically.
 */
function auditLogger(req, res, next) {
  res.on('finish', () => {
    const entry = res.locals.auditEntry;
    if (!entry || !req.user) return;
    if (res.statusCode >= 400) return; // only log successful mutations

    recordAuditLog({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      beforeState: entry.beforeState,
      afterState: entry.afterState,
      ipAddress: req.ip
    }).catch((err) => {
      logger.error('Failed to write audit log', { error: err.message, action: entry.action });
    });
  });

  next();
}

module.exports = auditLogger;
