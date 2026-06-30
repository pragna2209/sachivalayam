const express = require('express');
const activityController = require('./activity.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../config/constants');
const { listActivityLogsQuerySchema } = require('./activity.validation');

const router = express.Router();

router.get(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ query: listActivityLogsQuerySchema }),
  activityController.list
);

module.exports = router;
