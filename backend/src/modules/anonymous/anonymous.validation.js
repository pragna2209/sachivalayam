const { z } = require('zod');

const addressSchema = z.object({
  line1: z.string().trim().min(1).max(300),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits')
});

const gpsLocationSchema = z.object({
  coordinates: z.array(z.number()).length(2, 'coordinates must be [longitude, latitude]')
});

const createAnonymousComplaintSchema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.string().min(1),
  address: addressSchema,
  gpsLocation: gpsLocationSchema,
  mapLocationLabel: z.string().trim().max(300).optional(),
  districtId: z.string().min(1),
  mandalId: z.string().min(1),
  villageId: z.string().min(1),
  sachivalayamId: z.string().min(1),
  pin: z.string().regex(/^[0-9]{6}$/, 'PIN must be 6 digits'),
  optionalContactChannel: z
    .object({
      type: z.enum(['EMAIL', 'SMS']),
      value: z.string().trim().min(3)
    })
    .optional()
});

const trackAnonymousComplaintSchema = z.object({
  trackingId: z.string().trim().min(1),
  pin: z.string().regex(/^[0-9]{6}$/, 'PIN must be 6 digits')
});

module.exports = { createAnonymousComplaintSchema, trackAnonymousComplaintSchema };
