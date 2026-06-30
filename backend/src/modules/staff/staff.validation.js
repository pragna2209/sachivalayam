const { z } = require('zod');
const { STAFF_LIKE_ROLES, SUPPORTED_LANGUAGES, ROLES } = require('../../config/constants');

const phoneNumberSchema = z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits');

const jurisdictionSchema = z.object({
  districtId: z.string().min(1).optional(),
  mandalId: z.string().min(1).optional(),
  sachivalayamId: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional()
});

/**
 * Staff/Officer accounts are Admin-provisioned (Section 1.4) - the role
 * determines which jurisdiction fields are mandatory:
 *  - SACHIVALAYAM_STAFF requires the full chain down to sachivalayamId + departmentId
 *  - MANDAL_OFFICER requires districtId + mandalId
 *  - DISTRICT_OFFICER requires districtId only
 *  - ADMIN requires none
 */
const createStaffSchema = z
  .object({
    role: z.enum([...STAFF_LIKE_ROLES, ROLES.ADMIN]),
    phoneNumber: phoneNumberSchema,
    name: z.string().trim().min(2).max(100),
    email: z.string().email(),
    preferredLanguage: z.enum(SUPPORTED_LANGUAGES).optional(),
    jurisdiction: jurisdictionSchema
  })
  .refine(
    (data) => {
      if (data.role === ROLES.SACHIVALAYAM_STAFF) {
        return !!(
          data.jurisdiction.sachivalayamId &&
          data.jurisdiction.mandalId &&
          data.jurisdiction.districtId &&
          data.jurisdiction.departmentId
        );
      }
      if (data.role === ROLES.MANDAL_OFFICER) {
        return !!(data.jurisdiction.mandalId && data.jurisdiction.districtId);
      }
      if (data.role === ROLES.DISTRICT_OFFICER) {
        return !!data.jurisdiction.districtId;
      }
      return true;
    },
    { message: 'jurisdiction fields required for the given role are missing' }
  );

const updateStaffSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email().optional(),
  preferredLanguage: z.enum(SUPPORTED_LANGUAGES).optional(),
  jurisdiction: jurisdictionSchema.optional(),
  role: z.enum([...STAFF_LIKE_ROLES, ROLES.ADMIN]).optional()
});

const staffStatusSchema = z.object({
  isActive: z.boolean()
});

const staffIdParamSchema = z.object({ id: z.string().min(1) });

const listStaffQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum([...STAFF_LIKE_ROLES, ROLES.ADMIN]).optional(),
  districtId: z.string().optional(),
  mandalId: z.string().optional(),
  sachivalayamId: z.string().optional(),
  departmentId: z.string().optional()
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  staffStatusSchema,
  staffIdParamSchema,
  listStaffQuerySchema
};
