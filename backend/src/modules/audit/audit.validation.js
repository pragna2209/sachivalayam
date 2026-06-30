const { z } = require('zod');

const listAuditLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

module.exports = { listAuditLogsQuerySchema };
