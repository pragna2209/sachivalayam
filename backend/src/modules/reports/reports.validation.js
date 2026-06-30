const { z } = require('zod');

const exportReportQuerySchema = z.object({
  type: z.enum(['resolution-time', 'staff-performance', 'by-category', 'by-geo', 'complaints']),
  format: z.enum(['csv', 'pdf']).default('csv'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  districtId: z.string().optional(),
  mandalId: z.string().optional(),
  villageId: z.string().optional(),
  sachivalayamId: z.string().optional(),
  categoryId: z.string().optional(),
  level: z.enum(['district', 'mandal', 'village', 'sachivalayam']).optional()
});

module.exports = { exportReportQuerySchema };
