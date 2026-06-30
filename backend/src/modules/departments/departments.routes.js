const express = require('express');
const departmentsController = require('./departments.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../config/constants');
const { createDepartmentSchema, updateDepartmentSchema, departmentIdParamSchema } = require('./departments.validation');

const router = express.Router();

router.get('/', departmentsController.list);
router.post(
  '/',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ body: createDepartmentSchema }),
  auditLogger,
  departmentsController.create
);
router.patch(
  '/:id',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: departmentIdParamSchema, body: updateDepartmentSchema }),
  auditLogger,
  departmentsController.update
);

module.exports = router;
