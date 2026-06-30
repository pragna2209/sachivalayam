const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { t, resolveLanguage } = require('../i18n');

function buildLimiter({ windowMinutes, max, keyPrefix }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${keyPrefix}:${req.ip}`,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        data: null,
        error: 'TOO_MANY_REQUESTS',
        message: t('rateLimit.exceeded', resolveLanguage(req))
      });
    }
  });
}

// Global limiter applied to the entire API.
const globalLimiter = buildLimiter({
  windowMinutes: env.RATE_LIMIT_WINDOW_MINUTES,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  keyPrefix: 'global'
});

// Tighter limiter specifically for OTP request/verify - the most
// attractive endpoint for SMS-bombing / enumeration abuse.
const otpLimiter = buildLimiter({
  windowMinutes: env.OTP_REQUEST_WINDOW_MINUTES,
  max: env.OTP_MAX_REQUESTS_PER_WINDOW,
  keyPrefix: 'otp'
});
// Separate limiter for password login and registration
const authLimiter = buildLimiter({
  windowMinutes: 10,
  max: 20,
  keyPrefix: 'auth'
});
// Tighter limiter for anonymous tracking lookups and anonymous complaint
// submission - both are attractive to brute-force/enumeration attempts.
const anonymousLimiter = buildLimiter({
  windowMinutes: 10,
  max: 10,
  keyPrefix: 'anonymous'
});

module.exports = { globalLimiter, otpLimiter, anonymousLimiter,authLimiter };
