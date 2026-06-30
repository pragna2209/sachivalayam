const assignmentRules = require('./assignment.rules');
const { COMPLAINT_STATUS, ESCALATION_LEVEL, ESCALATION_TRIGGER } = require('../../config/constants');
const logger = require('../../utils/logger');

/**
 * Auto-assigns a freshly-created complaint. Returns the resolved
 * departmentId and (if found) the assigned staff's user document, plus a
 * flag indicating whether the fallback "no staff mapped" path was taken.
 *
 * Per the locked architectural decision (Section 1.4 / 11.3): if no Staff
 * is mapped to the exact Sachivalayam+Department combination, the
 * complaint is NOT left unassigned waiting for the 2-day scheduler - it is
 * routed straight to the Mandal Officer queue with an immediate
 * NO_STAFF_MAPPED escalation record, attached by the caller
 * (complaints.service.js) since that is where the Complaint document
 * itself is mutated and saved.
 */
async function autoAssign({ categoryId, sachivalayamId, mandalId }) {
  const departmentId = await assignmentRules.resolveDepartmentForCategory(categoryId);

  if (!departmentId) {
    logger.error('Assignment Engine: no department resolvable for category', { categoryId });
    return { departmentId: null, assignedStaff: null, fallbackTriggered: true, fallbackReason: 'NO_DEPARTMENT_MAPPED' };
  }

  const staff = await assignmentRules.findStaffForSachivalayamAndDepartment({ sachivalayamId, departmentId });

  if (!staff) {
    const mandalOfficer = await assignmentRules.findMandalOfficer(mandalId);
    return {
      departmentId,
      assignedStaff: null,
      fallbackTriggered: true,
      fallbackReason: 'NO_STAFF_MAPPED',
      fallbackEscalationTarget: mandalOfficer
    };
  }

  return { departmentId, assignedStaff: staff, fallbackTriggered: false };
}

/**
 * Builds the timeline event + (optional) escalation record objects for a
 * just-resolved auto-assignment outcome, to be pushed onto the Complaint
 * document by the caller. Kept here (rather than in complaints.service.js)
 * so all assignment-decision logic - including what it means when
 * assignment fails - lives in one module.
 */
function buildAssignmentOutcome({ assignmentResult }) {
  const events = { timelineEvent: null, escalationRecord: null, newStatus: null };

  if (!assignmentResult.fallbackTriggered) {
    events.newStatus = COMPLAINT_STATUS.ASSIGNED;
    events.timelineEvent = {
      status: COMPLAINT_STATUS.ASSIGNED,
      remark: 'Auto-assigned by Assignment Engine',
      actorRole: 'SYSTEM',
      occurredAt: new Date()
    };
    return events;
  }

  // Fallback path: complaint stays REGISTERED (truly unassigned) but an
  // escalation record is attached immediately rather than waiting 2 days.
  events.newStatus = COMPLAINT_STATUS.REGISTERED;
  if (assignmentResult.fallbackEscalationTarget) {
    events.escalationRecord = {
      level: ESCALATION_LEVEL.ASSIGNMENT_BREACH,
      escalatedTo: assignmentResult.fallbackEscalationTarget._id,
      reason: assignmentResult.fallbackReason,
      triggeredBy: ESCALATION_TRIGGER.MANUAL,
      triggeredAt: new Date(),
      resolvedFlag: false
    };
  }
  return events;
}

module.exports = { autoAssign, buildAssignmentOutcome };
