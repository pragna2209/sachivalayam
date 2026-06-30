const Complaint = require('../complaints/complaints.model');
const User = require('../users/users.model');
const escalationRules = require('./escalation.rules');
const notificationsService = require('../notifications/notifications.service');
const notificationTemplates = require('../notifications/notificationTemplates');
const {
  ESCALATION_LEVEL,
  ESCALATION_TRIGGER,
  ROLES,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL
} = require('../../config/constants');
const logger = require('../../utils/logger');

/**
 * Runs all three SLA-breach queries (Section 11.1) and fires escalations
 * for every matching complaint. Designed to be called repeatedly by the
 * cron scheduler (escalation.scheduler.js) without ever producing
 * duplicate escalation records, because each query already excludes
 * complaints that carry that level's escalation record (Section 11.2).
 *
 * Returns a summary object for logging/observability.
 */
async function runEscalationSweep() {
  const summary = {
    assignmentBreachCount: 0,
    mandalLevel1Count: 0,
    districtLevel2Count: 0,
    errors: []
  };

  await processAssignmentBreaches(summary);
  await processMandalLevel1Breaches(summary);
  await processDistrictLevel2Breaches(summary);

  logger.info('Escalation sweep complete', summary);
  return summary;
}

async function processAssignmentBreaches(summary) {
  const query = escalationRules.buildAssignmentBreachQuery();
  const complaints = await Complaint.find(query);

  for (const complaint of complaints) {
    try {
      const mandalOfficer = await User.findOne({
        role: ROLES.MANDAL_OFFICER,
        isActive: true,
        'jurisdiction.mandalId': complaint.mandalId
      }).lean();

      if (!mandalOfficer) {
        logger.warn('No Mandal Officer found for assignment-breach escalation', {
          complaintId: complaint._id,
          mandalId: complaint.mandalId
        });
        continue;
      }

      complaint.escalations.push({
        level: ESCALATION_LEVEL.ASSIGNMENT_BREACH,
        escalatedTo: mandalOfficer._id,
        reason: 'Not assigned within SLA window',
        triggeredBy: ESCALATION_TRIGGER.SYSTEM,
        triggeredAt: new Date(),
        resolvedFlag: false
      });

      await complaint.save();
      await notifyEscalation(complaint, ESCALATION_LEVEL.ASSIGNMENT_BREACH, mandalOfficer);
      summary.assignmentBreachCount += 1;
    } catch (err) {
      logger.error('Failed to process assignment-breach escalation', { error: err.message, complaintId: complaint._id });
      summary.errors.push({ complaintId: complaint._id, error: err.message });
    }
  }
}

async function processMandalLevel1Breaches(summary) {
  const query = escalationRules.buildMandalLevel1Query();
  const complaints = await Complaint.find(query);

  for (const complaint of complaints) {
    try {
      const mandalOfficer = await User.findOne({
        role: ROLES.MANDAL_OFFICER,
        isActive: true,
        'jurisdiction.mandalId': complaint.mandalId
      }).lean();

      if (!mandalOfficer) {
        logger.warn('No Mandal Officer found for Level-1 escalation', {
          complaintId: complaint._id,
          mandalId: complaint.mandalId
        });
        continue;
      }

      complaint.escalations.push({
        level: ESCALATION_LEVEL.MANDAL_LEVEL_1,
        escalatedTo: mandalOfficer._id,
        reason: 'Not resolved within 7-day SLA window',
        triggeredBy: ESCALATION_TRIGGER.SYSTEM,
        triggeredAt: new Date(),
        resolvedFlag: false
      });

      await complaint.save();
      await notifyEscalation(complaint, ESCALATION_LEVEL.MANDAL_LEVEL_1, mandalOfficer);
      summary.mandalLevel1Count += 1;
    } catch (err) {
      logger.error('Failed to process Level-1 escalation', { error: err.message, complaintId: complaint._id });
      summary.errors.push({ complaintId: complaint._id, error: err.message });
    }
  }
}

async function processDistrictLevel2Breaches(summary) {
  const query = escalationRules.buildDistrictLevel2Query();
  const complaints = await Complaint.find(query);

  for (const complaint of complaints) {
    try {
      const districtOfficer = await User.findOne({
        role: ROLES.DISTRICT_OFFICER,
        isActive: true,
        'jurisdiction.districtId': complaint.districtId
      }).lean();

      if (!districtOfficer) {
        logger.warn('No District Officer found for Level-2 escalation', {
          complaintId: complaint._id,
          districtId: complaint.districtId
        });
        continue;
      }

      complaint.escalations.push({
        level: ESCALATION_LEVEL.DISTRICT_LEVEL_2,
        escalatedTo: districtOfficer._id,
        reason: 'Not resolved within 15-day SLA window',
        triggeredBy: ESCALATION_TRIGGER.SYSTEM,
        triggeredAt: new Date(),
        resolvedFlag: false
      });

      await complaint.save();
      await notifyEscalation(complaint, ESCALATION_LEVEL.DISTRICT_LEVEL_2, districtOfficer);
      summary.districtLevel2Count += 1;
    } catch (err) {
      logger.error('Failed to process Level-2 escalation', { error: err.message, complaintId: complaint._id });
      summary.errors.push({ complaintId: complaint._id, error: err.message });
    }
  }
}

async function notifyEscalation(complaint, level, officer) {
  const content = notificationTemplates.escalationFired(complaint.complaintNumber, level);

  await notificationsService.dispatch({
    recipient: { userId: officer._id, email: officer.email, phoneNumber: officer.phoneNumber },
    complaintId: complaint._id,
    type: NOTIFICATION_TYPE.ESCALATION,
    content,
    channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
  });

  if (complaint.assignedTo) {
    const staff = await User.findById(complaint.assignedTo).lean();
    if (staff) {
      await notificationsService.dispatch({
        recipient: { userId: staff._id, email: staff.email, phoneNumber: staff.phoneNumber },
        complaintId: complaint._id,
        type: NOTIFICATION_TYPE.ESCALATION,
        content,
        channels: [NOTIFICATION_CHANNEL.IN_APP]
      });
    }
  }

  if (complaint.citizenId) {
    const citizen = await User.findById(complaint.citizenId).lean();
    if (citizen) {
      await notificationsService.dispatch({
        recipient: { userId: citizen._id, email: citizen.email, phoneNumber: citizen.phoneNumber },
        complaintId: complaint._id,
        type: NOTIFICATION_TYPE.ESCALATION,
        content,
        channels: [NOTIFICATION_CHANNEL.IN_APP]
      });
    }
  }
}

module.exports = { runEscalationSweep };
