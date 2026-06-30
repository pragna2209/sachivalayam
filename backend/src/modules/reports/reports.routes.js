const express = require('express');
const reportsController = require('./reports.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const scopeToJurisdiction = require('../../middlewares/scopeToJurisdiction.middleware');
const validate = require('../../middlewares/validate.middleware');
const trackActivity = require('../../middlewares/trackActivity.middleware');
const { ROLES, OFFICER_ROLES } = require('../../config/constants');
const { exportReportQuerySchema } = require('./reports.validation');

const router = express.Router();

router.get(
  '/export',
  verifyJWT,
  requireRole([...OFFICER_ROLES, ROLES.ADMIN]),
  scopeToJurisdiction,
  validate({ query: exportReportQuerySchema }),
  trackActivity((req) => `EXPORTED_REPORT:${req.query.type}`),
  reportsController.exportReport
);

module.exports = router;
