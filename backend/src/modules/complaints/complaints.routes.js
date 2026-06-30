const express = require('express');
const complaintsController = require('./complaints.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const scopeToJurisdiction = require('../../middlewares/scopeToJurisdiction.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const trackActivity = require('../../middlewares/trackActivity.middleware');
const { ROLES, STAFF_LIKE_ROLES, OFFICER_ROLES } = require('../../config/constants');
const {
  createComplaintSchema,
  listComplaintsQuerySchema,
  complaintIdParamSchema,
  updateStatusSchema,
  reassignSchema,
  escalateSchema,
  feedbackSchema
} = require('./complaints.validation');

const router = express.Router();

router.post(
  '/',
  verifyJWT,
  requireRole([ROLES.CITIZEN]),
  validate({ body: createComplaintSchema }),
  auditLogger,
  complaintsController.create
);

router.get(
  '/',
  verifyJWT,
  scopeToJurisdiction,
  validate({ query: listComplaintsQuerySchema }),
  complaintsController.list
);

router.get(
  '/:id',
  verifyJWT,
  scopeToJurisdiction,
  validate({ params: complaintIdParamSchema }),
  trackActivity('VIEWED_COMPLAINT'),
  complaintsController.getOne
);

router.get(
  '/:id/timeline',
  verifyJWT,
  scopeToJurisdiction,
  validate({ params: complaintIdParamSchema }),
  complaintsController.getTimeline
);

router.get(
  '/:id/escalations',
  verifyJWT,
  scopeToJurisdiction,
  validate({ params: complaintIdParamSchema }),
  complaintsController.getEscalations
);

router.patch(
  '/:id/status',
  verifyJWT,
  requireRole([...STAFF_LIKE_ROLES, ROLES.ADMIN]),
  scopeToJurisdiction,
  validate({ params: complaintIdParamSchema, body: updateStatusSchema }),
  auditLogger,
  complaintsController.updateStatus
);

router.post(
  '/:id/reopen',
  verifyJWT,
  requireRole([ROLES.CITIZEN]),
  validate({ params: complaintIdParamSchema, body: updateStatusSchema.pick({ remark: true }).partial() }),
  auditLogger,
  complaintsController.reopen
);

router.post(
  '/:id/feedback',
  verifyJWT,
  requireRole([ROLES.CITIZEN]),
  validate({ params: complaintIdParamSchema, body: feedbackSchema }),
  complaintsController.submitFeedback
);

router.patch(
  '/:id/reassign',
  verifyJWT,
  requireRole([...OFFICER_ROLES, ROLES.ADMIN]),
  scopeToJurisdiction,
  validate({ params: complaintIdParamSchema, body: reassignSchema }),
  auditLogger,
  complaintsController.reassign
);

router.patch(
  '/:id/escalate',
  verifyJWT,
  requireRole([...OFFICER_ROLES, ROLES.ADMIN]),
  scopeToJurisdiction,
  validate({ params: complaintIdParamSchema, body: escalateSchema }),
  auditLogger,
  complaintsController.escalate
);

module.exports = router;
