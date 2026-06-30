const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/appError');
const { t, resolveLanguage } = require('../i18n');
const User = require('../modules/users/users.model');

/**
 * Verifies the Authorization: Bearer <JWT> header, attaches the decoded
 * token payload AND the live user document to req.user / req.tokenPayload.
 * The live user lookup (not just trusting the JWT payload) ensures a
 * deactivated account is rejected immediately rather than waiting for the
 * access token to expire.
 */
async function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError(t('auth.unauthorized', resolveLanguage(req)));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new UnauthorizedError(t('auth.token.invalid', resolveLanguage(req)));
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      throw new UnauthorizedError(t('auth.userNotFound', resolveLanguage(req)));
    }
    if (!user.isActive) {
      throw new UnauthorizedError(t('auth.accountDeactivated', resolveLanguage(req)));
    }

    req.tokenPayload = decoded;
    req.user = {
      _id: user._id,
      role: user.role,
      jurisdiction: user.jurisdiction || null,
      preferredLanguage: user.preferredLanguage,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = verifyJWT;
