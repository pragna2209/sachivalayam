const express = require('express');
const settingsController = require('./settings.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../config/constants');
const { updateSettingSchema, settingKeyParamSchema } = require('./settings.validation');

const router = express.Router();

router.use(verifyJWT, requireRole([ROLES.ADMIN]));

router.get('/', settingsController.list);
router.patch(
  '/:key',
  validate({ params: settingKeyParamSchema, body: updateSettingSchema }),
  auditLogger,
  settingsController.update
);

module.exports = router;
