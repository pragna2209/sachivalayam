const Complaint = require('./complaints.model');
const Category = require('../categories/categories.model');
const User = require('../users/users.model');
const assignmentService = require('../assignment/assignment.service');
const notificationsService = require('../notifications/notifications.service');
const notificationTemplates = require('../notifications/notificationTemplates');
const { generateComplaintNumber } = require('../../utils/generateComplaintNumber');
const { assertValidTransition, canReopen } = require('./complaintLifecycle.fsm');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { NotFoundError, ForbiddenError, BadRequestError, ConflictError } = require('../../utils/appError');
const {
  COMPLAINT_STATUS,
  ROLES,
  ESCALATION_LEVEL,
  ESCALATION_TRIGGER,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL
} = require('../../config/constants');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Creates a new complaint on behalf of a registered citizen, immediately
 * runs the Assignment Engine against it, and writes the REGISTERED
 * timeline event (plus ASSIGNED event if auto-assignment succeeded, or an
 * immediate fallback escalation record if it did not - Section 11.3).
 */
async function createComplaint({ citizenId, payload }) {
  const category = await Category.findById(payload.categoryId).lean();
  if (!category) {
    throw new BadRequestError('Invalid category');
  }

  const complaintNumber = generateComplaintNumber();

  const registeredEvent = {
    status: COMPLAINT_STATUS.REGISTERED,
    remark: 'Complaint registered by citizen',
    actorId: citizenId,
    actorRole: ROLES.CITIZEN,
    occurredAt: new Date()
  };

  const assignmentResult = await assignmentService.autoAssign({
    categoryId: payload.categoryId,
    sachivalayamId: payload.sachivalayamId,
    mandalId: payload.mandalId
  });

  const outcome = assignmentService.buildAssignmentOutcome({ assignmentResult });

  const complaintDoc = {
    complaintNumber,
    citizenId,
    isAnonymous: false,
    anonymousTrackingId: null,
    title: payload.title,
    description: payload.description,
    categoryId: payload.categoryId,
    departmentId: assignmentResult.departmentId,
    address: payload.address,
    gpsLocation: { type: 'Point', coordinates: payload.gpsLocation.coordinates },
    mapLocationLabel: payload.mapLocationLabel || '',
    districtId: payload.districtId,
    mandalId: payload.mandalId,
    villageId: payload.villageId,
    sachivalayamId: payload.sachivalayamId,
    status: outcome.newStatus,
    assignedTo: assignmentResult.assignedStaff ? assignmentResult.assignedStaff._id : null,
    assignedAt: assignmentResult.assignedStaff ? new Date() : null,
    timeline: [registeredEvent, ...(outcome.timelineEvent ? [outcome.timelineEvent] : [])],
    escalations: outcome.escalationRecord ? [outcome.escalationRecord] : []
  };

  const complaint = await Complaint.create(complaintDoc);

  await notifyComplaintCreated(complaint, citizenId);
  if (assignmentResult.assignedStaff) {
    await notifyComplaintAssigned(complaint, assignmentResult.assignedStaff);
  }

  return complaint;
}

/**
 * Creates an anonymous complaint - identical lifecycle/assignment pipeline
 * as a registered citizen's complaint, but with no citizenId and an
 * anonymousTrackingId instead (Section 2.2 / 6.2.7).
 */
async function createAnonymousComplaint({ trackingId, payload }) {
  const category = await Category.findById(payload.categoryId).lean();
  if (!category) {
    throw new BadRequestError('Invalid category');
  }
  if (!category.isSensitive) {
    throw new BadRequestError('anonymous.categoryNotAllowed');
  }

  const complaintNumber = generateComplaintNumber();

  const registeredEvent = {
    status: COMPLAINT_STATUS.REGISTERED,
    remark: 'Anonymous complaint registered',
    actorRole: 'ANONYMOUS',
    occurredAt: new Date()
  };

  const assignmentResult = await assignmentService.autoAssign({
    categoryId: payload.categoryId,
    sachivalayamId: payload.sachivalayamId,
    mandalId: payload.mandalId
  });

  const outcome = assignmentService.buildAssignmentOutcome({ assignmentResult });

  const complaint = await Complaint.create({
    complaintNumber,
    citizenId: null,
    isAnonymous: true,
    anonymousTrackingId: trackingId,
    title: payload.title,
    description: payload.description,
    categoryId: payload.categoryId,
    departmentId: assignmentResult.departmentId,
    address: payload.address,
    gpsLocation: { type: 'Point', coordinates: payload.gpsLocation.coordinates },
    mapLocationLabel: payload.mapLocationLabel || '',
    districtId: payload.districtId,
    mandalId: payload.mandalId,
    villageId: payload.villageId,
    sachivalayamId: payload.sachivalayamId,
    status: outcome.newStatus,
    assignedTo: assignmentResult.assignedStaff ? assignmentResult.assignedStaff._id : null,
    assignedAt: assignmentResult.assignedStaff ? new Date() : null,
    timeline: [registeredEvent, ...(outcome.timelineEvent ? [outcome.timelineEvent] : [])],
    escalations: outcome.escalationRecord ? [outcome.escalationRecord] : []
  });

  if (assignmentResult.assignedStaff) {
    await notifyComplaintAssigned(complaint, assignmentResult.assignedStaff);
  }

  return complaint;
}

/**
 * Lists complaints scoped by the caller's jurisdictionFilter (already
 * computed by the scopeToJurisdiction middleware) merged with any
 * additional query filters the caller supplied. This is the defense-in-
 * depth re-check described in Section 9.2: jurisdictionFilter is ALWAYS
 * applied here regardless of what the route guard already did.
 */
async function listComplaints({ jurisdictionFilter, query }) {
  const filter = { ...jurisdictionFilter };

  if (query.status) filter.status = query.status;
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.districtId) filter.districtId = query.districtId;
  if (query.mandalId) filter.mandalId = query.mandalId;
  if (query.villageId) filter.villageId = query.villageId;
  if (query.sachivalayamId) filter.sachivalayamId = query.sachivalayamId;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const { skip } = parsePagination(query);
  const safeLimit = Math.min(parseInt(query.limit, 10) || 20, 100);

  const [items, totalCount] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('categoryId', 'name code')
      .populate('departmentId', 'name')
      .populate('assignedTo', 'name role phoneNumber')
      .lean(),
    Complaint.countDocuments(filter)
  ]);

  return {
    items,
    meta: buildPaginationMeta({ page: parseInt(query.page, 10) || 1, limit: safeLimit, totalCount })
  };
}

/**
 * Fetches a single complaint, re-checking jurisdiction ownership at the
 * data-access layer (not just trusting the route guard) - Section 9.2.
 */
async function getComplaintById({ id, jurisdictionFilter }) {
  const complaint = await Complaint.findOne({ _id: id, ...jurisdictionFilter })
    .populate('categoryId', 'name code isSensitive')
    .populate('departmentId', 'name')
    .populate('assignedTo', 'name role phoneNumber')
    .populate('citizenId', 'name phoneNumber email')
    .lean();

  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }
  return complaint;
}

async function getTimeline({ id, jurisdictionFilter }) {
  const complaint = await Complaint.findOne({ _id: id, ...jurisdictionFilter }, 'timeline complaintNumber').lean();
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }
  return complaint.timeline;
}

async function getEscalations({ id, jurisdictionFilter }) {
  const complaint = await Complaint.findOne({ _id: id, ...jurisdictionFilter }, 'escalations complaintNumber').lean();
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }
  return complaint.escalations;
}

/**
 * Staff/Officer-driven status transition. Validates against the lifecycle
 * FSM, appends a timeline event, and on RESOLVED additionally:
 *  - sets resolvedAt and the reopenDeadline (Section 1.4: reopen window)
 *  - marks any currently-open escalation records resolvedFlag = true
 *    (Section 11.4: de-escalation on resolution)
 *  - fires the feedback-request notification
 */
async function updateStatus({ id, jurisdictionFilter, actor, status, remark, evidenceFileIds }) {
  const complaint = await Complaint.findOne({ _id: id, ...jurisdictionFilter });
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }

  assertValidTransition(complaint.status, status);

  const beforeState = complaint.toObject();

  complaint.status = status;
  complaint.timeline.push({
    status,
    remark,
    actorId: actor._id,
    actorRole: actor.role,
    evidenceFileIds: evidenceFileIds || [],
    occurredAt: new Date()
  });

  if (status === COMPLAINT_STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
    complaint.reopenDeadline = new Date(Date.now() + env.REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    complaint.escalations.forEach((escalation) => {
      if (!escalation.resolvedFlag) escalation.resolvedFlag = true;
    });
  }

  if (status === COMPLAINT_STATUS.CLOSED) {
    complaint.closedAt = new Date();
  }

  await complaint.save();

  await notifyStatusChanged(complaint);
  if (status === COMPLAINT_STATUS.RESOLVED) {
    await notifyFeedbackRequested(complaint);
  }

  return { complaint, beforeState };
}

/**
 * Citizen reopens a Resolved/Closed complaint within the configured
 * window (Section 1.4: default 7 days, configurable; max reopen count
 * also configurable). Returns the complaint to UNDER_INVESTIGATION with
 * full timeline continuity (a new event is appended, history is kept).
 */
async function reopenComplaint({ id, citizenId, remark }) {
  const complaint = await Complaint.findOne({ _id: id, citizenId });
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }

  if (!canReopen(complaint.status)) {
    throw new BadRequestError('complaint.invalidTransition');
  }

  if (!complaint.reopenDeadline || complaint.reopenDeadline < new Date()) {
    throw new BadRequestError('complaint.reopenWindowExpired');
  }

  if (complaint.reopenCount >= env.REOPEN_MAX_COUNT) {
    throw new BadRequestError('complaint.reopenLimitReached');
  }

  assertValidTransition(complaint.status, COMPLAINT_STATUS.REOPENED);

  complaint.status = COMPLAINT_STATUS.REOPENED;
  complaint.reopenCount += 1;
  complaint.resolvedAt = null;
  complaint.closedAt = null;
  complaint.reopenDeadline = null;
  complaint.timeline.push({
    status: COMPLAINT_STATUS.REOPENED,
    remark: remark || 'Reopened by citizen',
    actorId: citizenId,
    actorRole: ROLES.CITIZEN,
    occurredAt: new Date()
  });

  await complaint.save();
  await notifyComplaintReopened(complaint);

  return complaint;
}

/**
 * Records citizen feedback. Only permitted once the complaint has reached
 * RESOLVED or CLOSED, and only once (feedback is a 0..1 embedded object,
 * not an array - resubmission overwrites the prior value by design since
 * there's exactly one feedback slot per complaint per the schema).
 */
async function submitFeedback({ id, citizenId, rating, comment }) {
  const complaint = await Complaint.findOne({ _id: id, citizenId });
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }

  if (![COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED].includes(complaint.status)) {
    throw new BadRequestError('complaint.feedbackOnlyAfterResolution');
  }

  complaint.feedback = { rating, comment: comment || '', submittedAt: new Date() };
  await complaint.save();
  return complaint;
}

/**
 * Manual reassignment by an Officer/Admin - overrides whatever the
 * Assignment Engine originally decided.
 */
async function reassignComplaint({ id, jurisdictionFilter, actor, assignedTo, remark }) {
  const complaint = await Complaint.findOne({ _id: id, ...jurisdictionFilter });
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }

  const newStaff = await User.findById(assignedTo).lean();
  if (!newStaff) {
    throw new BadRequestError('staff.notFound');
  }

  const beforeState = complaint.toObject();

  complaint.assignedTo = assignedTo;
  complaint.assignedAt = new Date();
  if (complaint.status === COMPLAINT_STATUS.REGISTERED) {
    complaint.status = COMPLAINT_STATUS.ASSIGNED;
  }
  complaint.timeline.push({
    status: complaint.status,
    remark: remark || `Manually reassigned by ${actor.role}`,
    actorId: actor._id,
    actorRole: actor.role,
    occurredAt: new Date()
  });

  await complaint.save();
  await notifyComplaintAssigned(complaint, newStaff);

  return { complaint, beforeState };
}

/**
 * Manual escalation trigger by an Officer/Admin, independent of the
 * scheduled SLA-breach escalation job (escalation.scheduler.js). Used
 * when an officer judges a complaint needs to go up a level immediately,
 * regardless of elapsed time.
 */
async function manualEscalate({ id, jurisdictionFilter, actor, level, reason }) {
  const complaint = await Complaint.findOne({ _id: id, ...jurisdictionFilter });
  if (!complaint) {
    throw new NotFoundError('complaint.accessDenied');
  }

  let escalatedToUser;
  if (level === ESCALATION_LEVEL.MANDAL_LEVEL_1) {
    escalatedToUser = await User.findOne({ role: ROLES.MANDAL_OFFICER, isActive: true, 'jurisdiction.mandalId': complaint.mandalId }).lean();
  } else if (level === ESCALATION_LEVEL.DISTRICT_LEVEL_2) {
    escalatedToUser = await User.findOne({ role: ROLES.DISTRICT_OFFICER, isActive: true, 'jurisdiction.districtId': complaint.districtId }).lean();
  }

  if (!escalatedToUser) {
    throw new NotFoundError('No officer found for the target escalation level');
  }

  complaint.escalations.push({
    level,
    escalatedTo: escalatedToUser._id,
    reason,
    triggeredBy: ESCALATION_TRIGGER.MANUAL,
    triggeredAt: new Date(),
    resolvedFlag: false
  });

  await complaint.save();
  await notifyEscalationFired(complaint, level, escalatedToUser);

  return complaint;
}

// --- Notification helper functions (wrap NotificationService.dispatch) ---

async function notifyComplaintCreated(complaint, citizenId) {
  const citizen = await User.findById(citizenId).lean();
  if (!citizen) return;
  const content = notificationTemplates.complaintRegistered(complaint.complaintNumber);
  await notificationsService.dispatch({
    recipient: { userId: citizen._id, email: citizen.email, phoneNumber: citizen.phoneNumber },
    complaintId: complaint._id,
    type: NOTIFICATION_TYPE.STATUS_CHANGE,
    content,
    channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
  });
}

async function notifyComplaintAssigned(complaint, staff) {
  const content = notificationTemplates.complaintAssigned(complaint.complaintNumber);

  if (complaint.citizenId) {
    const citizen = await User.findById(complaint.citizenId).lean();
    if (citizen) {
      await notificationsService.dispatch({
        recipient: { userId: citizen._id, email: citizen.email, phoneNumber: citizen.phoneNumber },
        complaintId: complaint._id,
        type: NOTIFICATION_TYPE.ASSIGNMENT,
        content,
        channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
      });
    }
  }

  await notificationsService.dispatch({
    recipient: { userId: staff._id, email: staff.email, phoneNumber: staff.phoneNumber },
    complaintId: complaint._id,
    type: NOTIFICATION_TYPE.ASSIGNMENT,
    content,
    channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
  });
}

async function notifyStatusChanged(complaint) {
  if (!complaint.citizenId && !complaint.anonymousTrackingId) return;
  const content = notificationTemplates.statusChanged(complaint.complaintNumber, complaint.status);

  if (complaint.citizenId) {
    const citizen = await User.findById(complaint.citizenId).lean();
    if (citizen) {
      await notificationsService.dispatch({
        recipient: { userId: citizen._id, email: citizen.email, phoneNumber: citizen.phoneNumber },
        complaintId: complaint._id,
        type: NOTIFICATION_TYPE.STATUS_CHANGE,
        content,
        channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
      });
    }
  } else if (complaint.anonymousTrackingId) {
    await notificationsService.dispatch({
      recipient: { anonymousTrackingId: complaint.anonymousTrackingId },
      complaintId: complaint._id,
      type: NOTIFICATION_TYPE.STATUS_CHANGE,
      content,
      channels: [NOTIFICATION_CHANNEL.IN_APP]
    });
  }
}

async function notifyFeedbackRequested(complaint) {
  if (!complaint.citizenId) return;
  const citizen = await User.findById(complaint.citizenId).lean();
  if (!citizen) return;
  const content = notificationTemplates.feedbackRequested(complaint.complaintNumber);
  await notificationsService.dispatch({
    recipient: { userId: citizen._id, email: citizen.email, phoneNumber: citizen.phoneNumber },
    complaintId: complaint._id,
    type: NOTIFICATION_TYPE.FEEDBACK_REQUEST,
    content,
    channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
  });
}

async function notifyComplaintReopened(complaint) {
  const content = notificationTemplates.complaintReopened(complaint.complaintNumber);
  if (complaint.assignedTo) {
    const staff = await User.findById(complaint.assignedTo).lean();
    if (staff) {
      await notificationsService.dispatch({
        recipient: { userId: staff._id, email: staff.email, phoneNumber: staff.phoneNumber },
        complaintId: complaint._id,
        type: NOTIFICATION_TYPE.REOPEN,
        content,
        channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
      });
    }
  }
}

async function notifyEscalationFired(complaint, level, escalatedToUser) {
  const content = notificationTemplates.escalationFired(complaint.complaintNumber, level);

  await notificationsService.dispatch({
    recipient: { userId: escalatedToUser._id, email: escalatedToUser.email, phoneNumber: escalatedToUser.phoneNumber },
    complaintId: complaint._id,
    type: NOTIFICATION_TYPE.ESCALATION,
    content,
    channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
  });

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

module.exports = {
  createComplaint,
  createAnonymousComplaint,
  listComplaints,
  getComplaintById,
  getTimeline,
  getEscalations,
  updateStatus,
  reopenComplaint,
  submitFeedback,
  reassignComplaint,
  manualEscalate,
  notifyEscalationFired
};
