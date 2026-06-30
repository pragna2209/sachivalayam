const { VALID_TRANSITIONS, COMPLAINT_STATUS } = require('../../config/constants');
const { BadRequestError } = require('../../utils/appError');

/**
 * Validates a proposed status transition against the fixed lifecycle
 * defined in the approved architecture:
 * Registered -> Assigned -> Under Investigation -> Action Taken ->
 * Resolved -> Closed, with Reopened as a re-entrant state from
 * Resolved/Closed back into Under Investigation.
 *
 * Throws if the transition is not allowed; returns silently (no return
 * value) if it is, so callers simply call assertValidTransition(...) as a
 * guard before mutating the complaint document.
 */
function assertValidTransition(currentStatus, nextStatus) {
  const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new BadRequestError('complaint.invalidTransition');
  }
}

function isTerminal(status) {
  return status === COMPLAINT_STATUS.RESOLVED || status === COMPLAINT_STATUS.CLOSED;
}

function canReopen(status) {
  return status === COMPLAINT_STATUS.RESOLVED || status === COMPLAINT_STATUS.CLOSED;
}

module.exports = { assertValidTransition, isTerminal, canReopen };
