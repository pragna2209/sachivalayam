const settingsService = require('./settings.service');
const { success } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');
const { NotFoundError } = require('../../utils/appError');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function list(req, res, next) {
  try {
    const items = await settingsService.listSettings();
    return success(res, { data: items });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function update(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const before = await settingsService.getSetting(req.params.key);
    const setting = await settingsService.upsertSetting(req.params.key, req.body, req.user._id);
    res.locals.auditEntry = {
      action: 'SYSTEM_SETTING_UPDATED',
      entityType: 'SystemSetting',
      entityId: setting._id,
      beforeState: before,
      afterState: setting.toObject()
    };
    return success(res, { data: setting, message: t('settings.updated', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { list, update };
