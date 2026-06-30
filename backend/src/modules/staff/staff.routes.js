const express = require('express');
const staffController = require('./staff.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../config/constants');
const {
  createStaffSchema,
  updateStaffSchema,
  staffStatusSchema,
  staffIdParamSchema,
  listStaffQuerySchema
} = require('./staff.validation');

const router = express.Router();

router.use(verifyJWT, requireRole([ROLES.ADMIN]));

router.post('/', validate({ body: createStaffSchema }), auditLogger, staffController.create);
router.get('/', validate({ query: listStaffQuerySchema }), staffController.list);
router.get('/:id', validate({ params: staffIdParamSchema }), staffController.getOne);
router.patch(
  '/:id',
  validate({ params: staffIdParamSchema, body: updateStaffSchema }),
  auditLogger,
  staffController.update
);
router.patch(
  '/:id/status',
  validate({ params: staffIdParamSchema, body: staffStatusSchema }),
  auditLogger,
  staffController.setStatus
);

module.exports = router;
