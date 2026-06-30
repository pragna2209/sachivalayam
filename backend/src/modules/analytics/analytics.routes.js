const express = require('express');
const analyticsController = require('./analytics.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const scopeToJurisdiction = require('../../middlewares/scopeToJurisdiction.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES, OFFICER_ROLES, STAFF_LIKE_ROLES } = require('../../config/constants');
const { dateRangeQuerySchema } = require('./analytics.validation');

const router = express.Router();

router.get(
  '/summary',
  verifyJWT,
  scopeToJurisdiction,
  validate({ query: dateRangeQuerySchema }),
  analyticsController.summary
);
router.get(
  '/by-category',
  verifyJWT,
  scopeToJurisdiction,
  validate({ query: dateRangeQuerySchema }),
  analyticsController.byCategory
);
router.get(
  '/by-geo',
  verifyJWT,
  scopeToJurisdiction,
  validate({ query: dateRangeQuerySchema }),
  analyticsController.byGeo
);
router.get(
  '/staff-performance',
  verifyJWT,
  requireRole([...OFFICER_ROLES, ROLES.ADMIN]),
  scopeToJurisdiction,
  validate({ query: dateRangeQuerySchema }),
  analyticsController.staffPerformance
);
router.get(
  '/resolution-time',
  verifyJWT,
  scopeToJurisdiction,
  validate({ query: dateRangeQuerySchema }),
  analyticsController.resolutionTime
);

module.exports = router;
