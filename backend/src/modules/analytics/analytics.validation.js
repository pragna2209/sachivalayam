const { z } = require('zod');

const dateRangeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  districtId: z.string().optional(),
  mandalId: z.string().optional(),
  villageId: z.string().optional(),
  sachivalayamId: z.string().optional(),
  categoryId: z.string().optional()
});

module.exports = { dateRangeQuerySchema };
