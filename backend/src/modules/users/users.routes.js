const express = require('express');
const usersController = require('./users.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../config/constants');
const { updateProfileSchema, listUsersQuerySchema, userIdParamSchema, userStatusSchema } = require('./users.validation');

const router = express.Router();

router.get('/me', verifyJWT, usersController.getMyProfile);
router.patch('/me', verifyJWT, validate({ body: updateProfileSchema }), usersController.updateMyProfile);

router.get(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ query: listUsersQuerySchema }),
  usersController.listCitizens
);
router.patch(
  '/:id/status',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: userIdParamSchema, body: userStatusSchema }),
  auditLogger,
  usersController.setStatus
);

module.exports = router;
