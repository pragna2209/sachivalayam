const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const { otpLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  requestOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  loginWithPasswordSchema,
  setPasswordSchema,
  directPasswordRegistrationSchema
} = require('./auth.validation');

const router = express.Router();

router.post('/otp/request', otpLimiter, validate({ body: requestOtpSchema }), authController.requestOtp);
router.post('/otp/verify', otpLimiter, validate({ body: verifyOtpSchema }), authController.verifyOtp);
router.post(
  '/register/password',
  otpLimiter, // public unauthenticated write endpoint - rate-limited like every other auth entry point
  validate({ body: directPasswordRegistrationSchema }),
  authController.registerWithPassword
);
router.post(
  '/login/password',
  otpLimiter, // same rate-limit cap as OTP - both are credential-guessing targets
  validate({ body: loginWithPasswordSchema }),
  authController.loginWithPassword
);
router.post(
  '/password',
  verifyJWT,
  validate({ body: setPasswordSchema }),
  authController.setPassword
);
router.post('/refresh-token', validate({ body: refreshTokenSchema }), authController.refreshToken);
router.post('/logout', verifyJWT, authController.logout);
router.get('/me', verifyJWT, authController.getMe);

module.exports = router;
