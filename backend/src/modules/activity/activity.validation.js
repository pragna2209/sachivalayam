const { z } = require('zod');

const listActivityLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional()
});

module.exports = { listActivityLogsQuerySchema };
