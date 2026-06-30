const anonymousService = require('./anonymous.service');
const { success, created } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function create(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const { trackingId, complaint } = await anonymousService.createAnonymousComplaint(req.body);
    return created(res, {
      data: { trackingId, complaintNumber: complaint.complaintNumber },
      message: t('anonymous.created', lang)
    });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function track(req, res, next) {
  try {
    const complaint = await anonymousService.trackAnonymousComplaint(req.body);
    return success(res, { data: complaint });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { create, track };
