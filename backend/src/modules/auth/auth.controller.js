const authService = require('./auth.service');
const { success, created } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');

async function requestOtp(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const result = await authService.requestOtp(req.body);
    return success(res, {
      data: result,
      message: t('auth.otp.sent', lang)
    });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function verifyOtp(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const { accessToken, refreshToken, user } = await authService.verifyOtp(req.body);
    const messageKey = req.body.purpose === 'REGISTER' ? 'auth.register.success' : 'auth.login.success';
    return success(res, {
      data: { accessToken, refreshToken, user },
      message: t(messageKey, lang)
    });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function refreshToken(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const result = await authService.refreshAccessToken(req.body);
    return success(res, { data: result, message: t('auth.token.refreshed', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function logout(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    // Stateless JWT logout: client discards tokens. Nothing server-side to
    // invalidate for the access token; if a token-blocklist is needed later
    // it can be added here without changing the route contract.
    return success(res, { data: null, message: t('auth.logout.success', lang) });
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return success(res, { data: user });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function loginWithPassword(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const result = await authService.loginWithPassword(req.body);
    return success(res, { data: result, message: t('auth.login.success', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function setPassword(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    await authService.setPassword({ userId: req.user._id, password: req.body.password });
    return success(res, { data: null, message: t('auth.password.set', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function registerWithPassword(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    const result = await authService.registerWithPassword(req.body);
    return created(res, { data: result, message: t('auth.register.success', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

/**
 * Service-layer errors throw with a translation KEY as the message
 * (e.g. "auth.otp.invalid") rather than a literal string, so the
 * controller can resolve it into the caller's language right before
 * it reaches the error handler. This keeps services language-agnostic.
 */
function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    const lang = resolveLanguage(req);
    const translated = t(err.message, lang);
    err.message = translated;
  }
  return err;
}

module.exports = {
  requestOtp,
  verifyOtp,
  refreshToken,
  logout,
  getMe,
  loginWithPassword,
  setPassword,
  registerWithPassword
};
