const express = require('express');
const auditController = require('./audit.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../config/constants');
const { listAuditLogsQuerySchema } = require('./audit.validation');

const router = express.Router();

// Deliberately GET-only: there is no POST/PATCH/DELETE route for audit
// logs anywhere in the API, including for Admin - the trail is written
// exclusively by auditLogger.middleware.js and is otherwise immutable
// (Section 9.7 of the approved architecture).
router.get(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ query: listAuditLogsQuerySchema }),
  auditController.list
);

module.exports = router;
