const express = require('express');
const evidenceController = require('./evidence.controller');
const verifyJWT = require('../../middlewares/verifyJWT.middleware');
const requireRole = require('../../middlewares/requireRole.middleware');
const validate = require('../../middlewares/validate.middleware');
const auditLogger = require('../../middlewares/auditLogger.middleware');
const { upload, verifyFileContent } = require('./fileValidation.middleware');
const { ROLES, STAFF_LIKE_ROLES } = require('../../config/constants');
const { uploadEvidenceParamsSchema, uploadEvidenceBodySchema, evidenceIdParamSchema } = require('./evidence.validation');

/**
 * Optional-auth middleware: attaches req.user if a valid Bearer token is
 * present, but does NOT reject the request if it's absent. This is what
 * lets an anonymous complainant attach evidence to their own
 * (unauthenticated) complaint at submission time, while a logged-in
 * citizen/staff member uploading evidence still gets req.user populated
 * for audit-logging purposes.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return next();
  }
  return verifyJWT(req, res, next);
}

// Mounted at /api/v1/complaints/:id/evidence (nested resource - upload only)
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.post(
  '/',
  optionalAuth,
  upload.single('file'),
  verifyFileContent,
  validate({ params: uploadEvidenceParamsSchema, body: uploadEvidenceBodySchema }),
  auditLogger,
  evidenceController.upload
);

// Mounted at /api/v1/evidence/:id (standalone resource - view/delete)
const standaloneRouter = express.Router();
standaloneRouter.get(
  '/:id',
  verifyJWT,
  validate({ params: evidenceIdParamSchema }),
  evidenceController.getSignedUrl
);
standaloneRouter.delete(
  '/:id',
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate({ params: evidenceIdParamSchema }),
  auditLogger,
  evidenceController.remove
);

module.exports = { nestedRouter, standaloneRouter };
