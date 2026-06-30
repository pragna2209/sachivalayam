const { z } = require('zod');
const { COMPLAINT_STATUS } = require('../../config/constants');

const addressSchema = z.object({
  line1: z.string().trim().min(1).max(300),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits')
});

const gpsLocationSchema = z.object({
  coordinates: z
    .array(z.number())
    .length(2, 'coordinates must be [longitude, latitude]')
});

const createComplaintSchema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.string().min(1),
  address: addressSchema,
  gpsLocation: gpsLocationSchema,
  mapLocationLabel: z.string().trim().max(300).optional(),
  districtId: z.string().min(1),
  mandalId: z.string().min(1),
  villageId: z.string().min(1),
  sachivalayamId: z.string().min(1)
});

const listComplaintsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(Object.values(COMPLAINT_STATUS)).optional(),
  categoryId: z.string().optional(),
  districtId: z.string().optional(),
  mandalId: z.string().optional(),
  villageId: z.string().optional(),
  sachivalayamId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const complaintIdParamSchema = z.object({ id: z.string().min(1) });

const updateStatusSchema = z.object({
  status: z.enum(Object.values(COMPLAINT_STATUS)),
  remark: z.string().trim().min(1).max(2000),
  evidenceFileIds: z.array(z.string()).optional()
});

const reassignSchema = z.object({
  assignedTo: z.string().min(1),
  remark: z.string().trim().min(1).max(2000).optional()
});

const escalateSchema = z.object({
  level: z.enum(['MANDAL_LEVEL_1', 'DISTRICT_LEVEL_2']),
  reason: z.string().trim().min(1).max(2000)
});

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional()
});

module.exports = {
  createComplaintSchema,
  listComplaintsQuerySchema,
  complaintIdParamSchema,
  updateStatusSchema,
  reassignSchema,
  escalateSchema,
  feedbackSchema
};
