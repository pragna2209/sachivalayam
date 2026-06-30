const geoService = require('./geo.service');
const { success, created } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function listDistricts(req, res, next) {
  try {
    const items = await geoService.listByParent('district', null);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function listMandalsByDistrict(req, res, next) {
  try {
    const items = await geoService.listByParent('mandal', req.params.id);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function listVillagesByMandal(req, res, next) {
  try {
    const items = await geoService.listByParent('village', req.params.id);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function listSachivalayamsByVillage(req, res, next) {
  try {
    const items = await geoService.listByParent('sachivalayam', req.params.id);
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function createNode(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const node = await geoService.createNode(req.params.level, req.body);
    res.locals.auditEntry = {
      action: `GEO_${req.params.level.toUpperCase()}_CREATED`,
      entityType: req.params.level,
      entityId: node._id,
      beforeState: null,
      afterState: node.toObject()
    };
    return created(res, { data: node, message: t('geo.created', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function updateNode(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const before = await geoService.getNodeById(req.params.level, req.params.id).catch(() => null);
    const node = await geoService.updateNode(req.params.level, req.params.id, req.body);
    res.locals.auditEntry = {
      action: `GEO_${req.params.level.toUpperCase()}_UPDATED`,
      entityType: req.params.level,
      entityId: node._id,
      beforeState: before,
      afterState: node.toObject()
    };
    return success(res, { data: node, message: t('geo.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function deleteNode(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const node = await geoService.softDeleteNode(req.params.level, req.params.id);
    res.locals.auditEntry = {
      action: `GEO_${req.params.level.toUpperCase()}_DEACTIVATED`,
      entityType: req.params.level,
      entityId: node._id,
      beforeState: null,
      afterState: node.toObject()
    };
    return success(res, { data: node, message: t('geo.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = {
  listDistricts,
  listMandalsByDistrict,
  listVillagesByMandal,
  listSachivalayamsByVillage,
  createNode,
  updateNode,
  deleteNode
};
