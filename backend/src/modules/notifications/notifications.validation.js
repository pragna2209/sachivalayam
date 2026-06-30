const { z } = require('zod');

const listNotificationsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional()
});

const notificationIdParamSchema = z.object({
  id: z.string().min(1)
});

const anonymousNotificationsBodySchema = z.object({
  trackingId: z.string().min(1),
  pin: z.string().regex(/^[0-9]{6}$/)
});

module.exports = { listNotificationsQuerySchema, notificationIdParamSchema, anonymousNotificationsBodySchema };
