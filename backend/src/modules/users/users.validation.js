const { z } = require('zod');
const { SUPPORTED_LANGUAGES } = require('../../config/constants');

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email().optional(),
  preferredLanguage: z.enum(SUPPORTED_LANGUAGES).optional(),
  address: z
    .object({
      line1: z.string().trim().min(1).optional(),
      pincode: z.string().regex(/^[0-9]{6}$/).optional(),
      districtId: z.string().min(1).optional(),
      mandalId: z.string().min(1).optional(),
      villageId: z.string().min(1).optional(),
      sachivalayamId: z.string().min(1).optional()
    })
    .optional()
});

const listUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().trim().max(100).optional()
});

const userIdParamSchema = z.object({ id: z.string().min(1) });

const userStatusSchema = z.object({ isActive: z.boolean() });

module.exports = { updateProfileSchema, listUsersQuerySchema, userIdParamSchema, userStatusSchema };
