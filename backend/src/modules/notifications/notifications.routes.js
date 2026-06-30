const express = require('express');
const notificationsController = require('./notifications.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const validate = require('../../middlewares/validate.middleware');
const { anonymousLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  anonymousNotificationsBodySchema
} = require('./notifications.validation');

const router = express.Router();

router.get('/', verifyJWT, validate({ query: listNotificationsQuerySchema }), notificationsController.listMine);
router.patch('/read-all', verifyJWT, notificationsController.markAllRead);
router.patch(
  '/:id/read',
  verifyJWT,
  validate({ params: notificationIdParamSchema }),
  notificationsController.markRead
);

// Public router for anonymous complainants - mounted separately at
// /api/v1/anonymous/notifications in app.js
const anonymousRouter = express.Router();
anonymousRouter.post(
  '/',
  anonymousLimiter,
  validate({ body: anonymousNotificationsBodySchema }),
  notificationsController.listAnonymous
);

module.exports = { router, anonymousRouter };
