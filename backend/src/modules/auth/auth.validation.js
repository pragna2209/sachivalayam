const { z } = require('zod');
const { OTP_PURPOSE, SUPPORTED_LANGUAGES } = require('../../config/constants');

const phoneNumberSchema = z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits');

const requestOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  purpose: z.enum([OTP_PURPOSE.REGISTER, OTP_PURPOSE.LOGIN])
});

const verifyOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: z.string().regex(/^[0-9]{4,8}$/, 'OTP must be numeric'),
  purpose: z.enum([OTP_PURPOSE.REGISTER, OTP_PURPOSE.LOGIN]),
  // Only required/used when purpose === REGISTER; profile fields below.
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email().optional(),
  preferredLanguage: z.enum(SUPPORTED_LANGUAGES).optional(),
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/).optional(),
  address: z
    .object({
      line1: z.string().trim().min(1),
      pincode: z.string().regex(/^[0-9]{6}$/),
      districtId: z.string().min(1),
      mandalId: z.string().min(1),
      villageId: z.string().min(1),
      sachivalayamId: z.string().min(1)
    })
    .optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10)
});

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const loginWithPasswordSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: z.string().min(1)
});

const setPasswordSchema = z.object({
  password: passwordSchema
});

const registerWithPasswordSchema = verifyOtpSchema.extend({
  password: passwordSchema.optional()
});

/**
 * Fully independent registration path: phone number + password only, no
 * OTP step at all. Per explicit confirmation from the project owner, this
 * means the phone number is NOT verified to belong to the registrant -
 * unlike every other registration/login path in this system. Kept as a
 * deliberately separate schema/endpoint from the OTP flow so the two
 * paths can never be confused with each other at the route or validation
 * layer.
 */
const directPasswordRegistrationSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: passwordSchema,
  name: z.string().trim().min(2).max(100),
  email: z.string().email().optional(),
  preferredLanguage: z.enum(SUPPORTED_LANGUAGES).optional(),
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/).optional(),
  address: z.object({
    line1: z.string().trim().min(1),
    pincode: z.string().regex(/^[0-9]{6}$/),
    districtId: z.string().min(1),
    mandalId: z.string().min(1),
    villageId: z.string().min(1),
    sachivalayamId: z.string().min(1)
  })
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  phoneNumberSchema,
  passwordSchema,
  loginWithPasswordSchema,
  setPasswordSchema,
  registerWithPasswordSchema,
  directPasswordRegistrationSchema
};
