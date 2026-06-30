const env = require('../../config/env');
const { COMPLAINT_STATUS, ESCALATION_LEVEL } = require('../../config/constants');

/**
 * Returns the three idempotent SLA-breach query filters described in
 * Section 11.1 of the approved architecture. Each query additionally
 * excludes complaints that already carry an escalation record at that
 * exact level (the "NOT already escalated at this level" guard from
 * Section 11.2), which is what makes re-running the scheduler safe.
 */
function buildAssignmentBreachQuery() {
  const cutoff = new Date(Date.now() - env.ESCALATION_ASSIGNMENT_BREACH_DAYS * 24 * 60 * 60 * 1000);
  return {
    status: COMPLAINT_STATUS.REGISTERED,
    assignedTo: null,
    createdAt: { $lt: cutoff },
    'escalations.level': { $ne: ESCALATION_LEVEL.ASSIGNMENT_BREACH }
  };
}

function buildMandalLevel1Query() {
  const cutoff = new Date(Date.now() - env.ESCALATION_MANDAL_LEVEL1_DAYS * 24 * 60 * 60 * 1000);
  return {
    status: { $nin: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
    createdAt: { $lt: cutoff },
    'escalations.level': { $ne: ESCALATION_LEVEL.MANDAL_LEVEL_1 }
  };
}

function buildDistrictLevel2Query() {
  const cutoff = new Date(Date.now() - env.ESCALATION_DISTRICT_LEVEL2_DAYS * 24 * 60 * 60 * 1000);
  return {
    status: { $nin: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
    createdAt: { $lt: cutoff },
    'escalations.level': { $ne: ESCALATION_LEVEL.DISTRICT_LEVEL_2 }
  };
}

module.exports = { buildAssignmentBreachQuery, buildMandalLevel1Query, buildDistrictLevel2Query };
