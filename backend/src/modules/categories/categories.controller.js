const categoriesService = require('./categories.service');
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
    const items = await categoriesService.listCategories(req.query);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function create(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const category = await categoriesService.createCategory(req.body);
    res.locals.auditEntry = {
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category._id,
      beforeState: null,
      afterState: category.toObject()
    };
    return created(res, { data: category, message: t('category.created', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function update(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const before = await categoriesService.getCategoryById(req.params.id).catch(() => null);
    const category = await categoriesService.updateCategory(req.params.id, req.body);
    res.locals.auditEntry = {
      action: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityId: category._id,
      beforeState: before,
      afterState: category.toObject()
    };
    return success(res, { data: category, message: t('category.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function listMappings(req, res, next) {
  try {
    const items = await categoriesService.listMappings(req.query);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function createMapping(req, res, next) {
  try {
    const mapping = await categoriesService.createMapping(req.body);
    res.locals.auditEntry = {
      action: 'CATEGORY_DEPARTMENT_MAPPING_CREATED',
      entityType: 'CategoryDepartmentMapping',
      entityId: mapping._id,
      beforeState: null,
      afterState: mapping.toObject()
    };
    return created(res, { data: mapping });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function updateMapping(req, res, next) {
  try {
    const mapping = await categoriesService.updateMapping(req.params.id, req.body);
    res.locals.auditEntry = {
      action: 'CATEGORY_DEPARTMENT_MAPPING_UPDATED',
      entityType: 'CategoryDepartmentMapping',
      entityId: mapping._id,
      beforeState: null,
      afterState: mapping.toObject()
    };
    return success(res, { data: mapping });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { list, create, update, listMappings, createMapping, updateMapping };
