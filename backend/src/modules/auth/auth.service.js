const bcrypt = require('bcryptjs');
const OtpRequest = require('./otpRequest.model');
const User = require('../users/users.model');
const { generateOtp } = require('../../utils/otpGenerator');
const { signAccessToken, signRefreshToken, verifyRefreshToken, buildTokenPayload } = require('../../utils/jwt');
const { BadRequestError, UnauthorizedError, ConflictError, TooManyRequestsError, NotFoundError } = require('../../utils/appError');
const { OTP_PURPOSE, ROLES } = require('../../config/constants');
const env = require('../../config/env');
const notificationService = require('../notifications/notifications.service');

const SALT_ROUNDS = 10;

/**
 * Issues an OTP for the given phone number + purpose, enforcing the
 * request-rate cap (Section 9.1: 3 requests / 10 minutes by default,
 * configurable via env). The OTP itself is salted-hashed before storage -
 * plaintext OTPs are never persisted.
 */
async function requestOtp({ phoneNumber, purpose }) {
  const windowStart = new Date(Date.now() - env.OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);
  const recentCount = await OtpRequest.countDocuments({
    phoneNumber,
    purpose,
    createdAt: { $gte: windowStart }
  });

  if (recentCount >= env.OTP_MAX_REQUESTS_PER_WINDOW) {
    throw new TooManyRequestsError('auth.otp.tooManyRequests');
  }

  if (purpose === OTP_PURPOSE.LOGIN) {
    const existingUser = await User.findOne({ phoneNumber }).lean();
    if (!existingUser) {
      throw new NotFoundError('auth.userNotFound');
    }
    if (!existingUser.isActive) {
      throw new UnauthorizedError('auth.accountDeactivated');
    }
  }

  if (purpose === OTP_PURPOSE.REGISTER) {
    const existingUser = await User.findOne({ phoneNumber }).lean();
    if (existingUser) {
      throw new ConflictError('auth.phoneAlreadyRegistered');
    }
  }

  const otp = generateOtp(env.OTP_LENGTH);
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  await OtpRequest.create({ phoneNumber, otpHash, purpose, expiresAt });

  // In production this dispatches through the pluggable SMS adapter
  // (Section 10.1). The OTP value itself is returned here ONLY in
  // non-production environments to ease local testing without a live
  // SMS gateway - production builds never echo it back.
  await notificationService.dispatchOtpSms({ phoneNumber, otp });

  return { expiresInMinutes: env.OTP_EXPIRES_IN_MINUTES, devOtp: env.IS_PRODUCTION ? undefined : otp };
}

/**
 * Verifies an OTP. For LOGIN purpose, issues tokens for the existing user.
 * For REGISTER purpose, creates a new CITIZEN user (profile fields required)
 * and issues tokens for it. Rate-limits verify attempts per OTP record
 * (Section 9.1: 5 attempts before invalidation).
 */
async function verifyOtp({ phoneNumber, otp, purpose, name, email, preferredLanguage, aadhaarNumber, address, password }) {
  const otpRecord = await OtpRequest.findOne({ phoneNumber, purpose, consumedAt: null }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new BadRequestError('auth.otp.invalid');
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new BadRequestError('auth.otp.expired');
  }

  if (otpRecord.attemptCount >= env.OTP_MAX_VERIFY_ATTEMPTS) {
    throw new TooManyRequestsError('auth.otp.tooManyAttempts');
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    otpRecord.attemptCount += 1;
    await otpRecord.save();
    throw new BadRequestError('auth.otp.invalid');
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  let user;

  if (purpose === OTP_PURPOSE.REGISTER) {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      throw new ConflictError('auth.phoneAlreadyRegistered');
    }
    if (!name || !address) {
      throw new BadRequestError('Name and address are required to complete registration');
    }

    user = await User.create({
      role: ROLES.CITIZEN,
      phoneNumber,
      name,
      email: email || null,
      preferredLanguage: preferredLanguage || 'en',
      aadhaarNumber: aadhaarNumber || null,
      address,
      passwordHash: password ? await bcrypt.hash(password, SALT_ROUNDS) : null,
      isActive: true
    });
  } else {
    user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundError('auth.userNotFound');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('auth.accountDeactivated');
    }
    user.lastLoginAt = new Date();
    await user.save();
  }

  const tokenPayload = buildTokenPayload(user);
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user._id.toString() });

  return {
    accessToken,
    refreshToken,
    user: user.toSafeJSON ? user.toSafeJSON() : user
  };
}

/**
 * Rotates an access token given a valid, non-expired refresh token. The
 * user is re-fetched live so a deactivated account is rejected even with
 * a technically-valid refresh token still in hand.
 */
async function refreshAccessToken({ refreshToken }) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new UnauthorizedError('auth.token.invalid');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError('auth.userNotFound');
  }
  if (!user.isActive) {
    throw new UnauthorizedError('auth.accountDeactivated');
  }

  const accessToken = signAccessToken(buildTokenPayload(user));
  return { accessToken };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new NotFoundError('auth.userNotFound');
  }
  return user;
}

/**
 * Logs in using phone number + password instead of OTP. Only works for
 * accounts that have actually set a password (passwordHash !== null) -
 * an OTP-only account cannot be logged into this way, and the error
 * message is deliberately the same "invalid credentials" style response
 * whether the phone doesn't exist, the account has no password set, or
 * the password is wrong, so this endpoint can't be used to enumerate
 * which phone numbers are registered.
 */
async function loginWithPassword({ phoneNumber, password }) {
  const user = await User.findOne({ phoneNumber }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('auth.password.invalidCredentials');
  }
  if (!user.isActive) {
    throw new UnauthorizedError('auth.accountDeactivated');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('auth.password.invalidCredentials');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokenPayload = buildTokenPayload(user);
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user._id.toString() });

  return {
    accessToken,
    refreshToken,
    user: user.toSafeJSON()
  };
}

/**
 * Sets or changes the password for an already-authenticated user (i.e.
 * they got here via a valid JWT, which they obtained through OTP or an
 * existing password). This is the only way an existing OTP-only account
 * can opt into password login later - there is deliberately no
 * "forgot password" reset flow yet, since OTP login already serves as
 * the account-recovery path for anyone who forgets their password.
 */
async function setPassword({ userId, password }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('auth.userNotFound');
  }
  user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await user.save();
  return { success: true };
}

/**
 * Direct registration with phone number + password, no OTP step. Per
 * explicit confirmation, this does NOT verify phone ownership - any
 * phone number can be registered this way, unlike every other path in
 * this system. Kept entirely separate from verifyOtp() above rather than
 * merged into it, so the no-verification behavior is isolated to this one
 * function and can't accidentally leak into the OTP-based flow.
 */
async function registerWithPassword({ phoneNumber, password, name, email, preferredLanguage, aadhaarNumber, address }) {
  const existingUser = await User.findOne({ phoneNumber }).lean();
  if (existingUser) {
    throw new ConflictError('auth.phoneAlreadyRegistered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    role: ROLES.CITIZEN,
    phoneNumber,
    name,
    email: email || null,
    preferredLanguage: preferredLanguage || 'en',
    aadhaarNumber: aadhaarNumber || null,
    address,
    passwordHash,
    isActive: true
  });

  const tokenPayload = buildTokenPayload(user);
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user._id.toString() });

  return {
    accessToken,
    refreshToken,
    user: user.toSafeJSON()
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
  refreshAccessToken,
  getCurrentUser,
  loginWithPassword,
  setPassword,
  registerWithPassword
};
