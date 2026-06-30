const complaintsService = require('./complaints.service');
const { success, created } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');
const { ROLES } = require('../../config/constants');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function create(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const complaint = await complaintsService.createComplaint({ citizenId: req.user._id, payload: req.body });
    res.locals.auditEntry = {
      action: 'COMPLAINT_CREATED',
      entityType: 'Complaint',
      entityId: complaint._id,
      beforeState: null,
      afterState: complaint.toObject()
    };
    return created(res, { data: complaint, message: t('complaint.created', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function list(req, res, next) {
  try {
    const result = await complaintsService.listComplaints({
      jurisdictionFilter: req.jurisdictionFilter,
      query: req.query
    });
    return success(res, { data: result.items, meta: result.meta });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function getOne(req, res, next) {
  try {
    const complaint = await complaintsService.getComplaintById({
      id: req.params.id,
      jurisdictionFilter: req.jurisdictionFilter
    });
    return success(res, { data: complaint });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function getTimeline(req, res, next) {
  try {
    const timeline = await complaintsService.getTimeline({
      id: req.params.id,
      jurisdictionFilter: req.jurisdictionFilter
    });
    return success(res, { data: timeline });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function getEscalations(req, res, next) {
  try {
    const escalations = await complaintsService.getEscalations({
      id: req.params.id,
      jurisdictionFilter: req.jurisdictionFilter
    });
    return success(res, { data: escalations });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function updateStatus(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const { complaint, beforeState } = await complaintsService.updateStatus({
      id: req.params.id,
      jurisdictionFilter: req.jurisdictionFilter,
      actor: req.user,
      status: req.body.status,
      remark: req.body.remark,
      evidenceFileIds: req.body.evidenceFileIds
    });
    res.locals.auditEntry = {
      action: 'COMPLAINT_STATUS_UPDATED',
      entityType: 'Complaint',
      entityId: complaint._id,
      beforeState,
      afterState: complaint.toObject()
    };
    return success(res, { data: complaint, message: t('complaint.statusUpdated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function reopen(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const complaint = await complaintsService.reopenComplaint({
      id: req.params.id,
      citizenId: req.user._id,
      remark: req.body.remark
    });
    res.locals.auditEntry = {
      action: 'COMPLAINT_REOPENED',
      entityType: 'Complaint',
      entityId: complaint._id,
      beforeState: null,
      afterState: complaint.toObject()
    };
    return success(res, { data: complaint, message: t('complaint.reopenSuccess', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function submitFeedback(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const complaint = await complaintsService.submitFeedback({
      id: req.params.id,
      citizenId: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });
    return success(res, { data: complaint, message: t('complaint.feedbackSubmitted', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function reassign(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const { complaint, beforeState } = await complaintsService.reassignComplaint({
      id: req.params.id,
      jurisdictionFilter: req.jurisdictionFilter,
      actor: req.user,
      assignedTo: req.body.assignedTo,
      remark: req.body.remark
    });
    res.locals.auditEntry = {
      action: 'COMPLAINT_REASSIGNED',
      entityType: 'Complaint',
      entityId: complaint._id,
      beforeState,
      afterState: complaint.toObject()
    };
    return success(res, { data: complaint, message: t('complaint.reassigned', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function escalate(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const complaint = await complaintsService.manualEscalate({
      id: req.params.id,
      jurisdictionFilter: req.jurisdictionFilter,
      actor: req.user,
      level: req.body.level,
      reason: req.body.reason
    });
    res.locals.auditEntry = {
      action: 'COMPLAINT_ESCALATED_MANUALLY',
      entityType: 'Complaint',
      entityId: complaint._id,
      beforeState: null,
      afterState: complaint.toObject()
    };
    return success(res, { data: complaint, message: t('complaint.escalated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = {
  create,
  list,
  getOne,
  getTimeline,
  getEscalations,
  updateStatus,
  reopen,
  submitFeedback,
  reassign,
  escalate
};
