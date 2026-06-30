const usersService = require('./users.service');
const { success } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function getMyProfile(req, res, next) {
  try {
    const user = await usersService.getProfile(req.user._id);
    return success(res, { data: user });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const user = await usersService.updateProfile(req.user._id, req.body);
    return success(res, { data: user });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function listCitizens(req, res, next) {
  try {
    const result = await usersService.listCitizens(req.query);
    return success(res, { data: result.items, meta: result.meta });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function setStatus(req, res, next) {
  try {
    const user = await usersService.setCitizenStatus(req.params.id, req.body.isActive);
    res.locals.auditEntry = {
      action: req.body.isActive ? 'CITIZEN_ACTIVATED' : 'CITIZEN_DEACTIVATED',
      entityType: 'User',
      entityId: user._id,
      beforeState: null,
      afterState: user.toSafeJSON()
    };
    return success(res, { data: user.toSafeJSON() });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { getMyProfile, updateMyProfile, listCitizens, setStatus };
