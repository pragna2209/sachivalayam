const staffService = require('./staff.service');
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
    const staff = await staffService.createStaff({ payload: req.body, createdBy: req.user._id });
    res.locals.auditEntry = {
      action: 'STAFF_CREATED',
      entityType: 'User',
      entityId: staff._id,
      beforeState: null,
      afterState: staff.toSafeJSON()
    };
    return created(res, { data: staff.toSafeJSON(), message: t('staff.created', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function list(req, res, next) {
  try {
    const result = await staffService.listStaff(req.query);
    return success(res, { data: result.items, meta: result.meta });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function getOne(req, res, next) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    return success(res, { data: staff });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function update(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const before = await staffService.getStaffById(req.params.id).catch(() => null);
    const staff = await staffService.updateStaff(req.params.id, req.body);
    res.locals.auditEntry = {
      action: 'STAFF_UPDATED',
      entityType: 'User',
      entityId: staff._id,
      beforeState: before,
      afterState: staff.toSafeJSON()
    };
    return success(res, { data: staff.toSafeJSON(), message: t('staff.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function setStatus(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const staff = await staffService.setStaffStatus(req.params.id, req.body.isActive);
    res.locals.auditEntry = {
      action: req.body.isActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
      entityType: 'User',
      entityId: staff._id,
      beforeState: null,
      afterState: staff.toSafeJSON()
    };
    return success(res, { data: staff.toSafeJSON(), message: t('staff.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { create, list, getOne, update, setStatus };
