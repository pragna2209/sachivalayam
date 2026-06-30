const departmentsService = require('./departments.service');
const { success, created } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function list(req, res, next) {
  try {
    const items = await departmentsService.listDepartments(req.query);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function create(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const department = await departmentsService.createDepartment(req.body);
    res.locals.auditEntry = {
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: department._id,
      beforeState: null,
      afterState: department.toObject()
    };
    return created(res, { data: department, message: t('department.created', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function update(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const before = await departmentsService.getDepartmentById(req.params.id).catch(() => null);
    const department = await departmentsService.updateDepartment(req.params.id, req.body);
    res.locals.auditEntry = {
      action: 'DEPARTMENT_UPDATED',
      entityType: 'Department',
      entityId: department._id,
      beforeState: before,
      afterState: department.toObject()
    };
    return success(res, { data: department, message: t('department.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { list, create, update };
