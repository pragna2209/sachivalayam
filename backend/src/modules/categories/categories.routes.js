const express = require('express');
const categoriesController = require('./categories.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../config/constants');
const { createCategorySchema, updateCategorySchema, categoryIdParamSchema } = require('./categories.validation');
const {
  createMappingSchema,
  updateMappingSchema,
  mappingIdParamSchema,
  mappingQuerySchema
} = require('./categoryDepartmentMapping.validation');

const router = express.Router();

router.get('/', categoriesController.list);
router.post(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ body: createCategorySchema }),
  auditLogger,
  categoriesController.create
);
router.patch(
  '/:id',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  auditLogger,
  categoriesController.update
);

// Category-Department mapping sub-resource, used by the Assignment Engine.
const mappingsRouter = express.Router();
mappingsRouter.get(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ query: mappingQuerySchema }),
  categoriesController.listMappings
);
mappingsRouter.post(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ body: createMappingSchema }),
  auditLogger,
  categoriesController.createMapping
);
mappingsRouter.patch(
  '/:id',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: mappingIdParamSchema, body: updateMappingSchema }),
  auditLogger,
  categoriesController.updateMapping
);

module.exports = { router, mappingsRouter };
