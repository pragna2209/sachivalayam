const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * JWT payload intentionally carries { userId, role, jurisdiction } so
 * authorization middleware can scope queries without an extra DB round-trip
 * on every request (Section 9.2 of the approved architecture).
 */
function buildTokenPayload(user) {
  return {
    userId: user._id.toString(),
    role: user.role,
    jurisdiction: user.jurisdiction || null,
    preferredLanguage: user.preferredLanguage
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenPayload
};
