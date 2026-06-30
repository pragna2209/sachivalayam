const { ForbiddenError, UnauthorizedError } = require('../utils/appError');
const { t, resolveLanguage } = require('../i18n');

/**
 * Restricts a route to a fixed set of roles. Must run after verifyJWT.
 * Usage: requireRole(['ADMIN']), requireRole(['MANDAL_OFFICER', 'DISTRICT_OFFICER'])
 */
function requireRole(allowedRoles = []) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new UnauthorizedError(t('auth.unauthorized', resolveLanguage(req))));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(t('auth.forbidden', resolveLanguage(req))));
    }
    return next();
  };
}

module.exports = requireRole;
