const express = require('express');
const geoController = require('./geo.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../config/constants');
const {
  createGeoNodeSchema,
  updateGeoNodeSchema,
  geoLevelParamSchema,
  geoLevelIdParamSchema,
  geoIdParamSchema
} = require('./geo.validation');

const router = express.Router();

// Public read endpoints - geo-hierarchy is reference data needed by the
// complaint form before the citizen is necessarily logged in.
router.get('/districts', geoController.listDistricts);
router.get('/districts/:id/mandals', validate({ params: geoIdParamSchema }), geoController.listMandalsByDistrict);
router.get('/mandals/:id/villages', validate({ params: geoIdParamSchema }), geoController.listVillagesByMandal);
router.get(
  '/villages/:id/sachivalayams',
  validate({ params: geoIdParamSchema }),
  geoController.listSachivalayamsByVillage
);

// Admin-only write endpoints.
router.post(
  '/:level',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: geoLevelParamSchema, body: createGeoNodeSchema }),
  auditLogger,
  geoController.createNode
);
router.patch(
  '/:level/:id',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: geoLevelIdParamSchema, body: updateGeoNodeSchema }),
  auditLogger,
  geoController.updateNode
);
router.delete(
  '/:level/:id',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: geoLevelIdParamSchema }),
  auditLogger,
  geoController.deleteNode
);

module.exports = router;
