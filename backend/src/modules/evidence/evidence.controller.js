const evidenceService = require('./evidence.service');
const { success, created } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');
const { BadRequestError } = require('../../utils/appError');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function upload(req, res, next) {
  try {
    const lang = resolveLanguage(req);
    if (!req.file) {
      throw new BadRequestError('evidence.invalidFileType');
    }

    const evidence = await evidenceService.uploadEvidence({
      complaintId: req.params.id,
      file: req.file,
      uploadedBy: req.user ? req.user._id : null,
      uploaderRole: req.user ? req.user.role : 'ANONYMOUS',
      uploadedAtStage: req.body.uploadedAtStage
    });

    res.locals.auditEntry = req.user
      ? {
          action: 'EVIDENCE_UPLOADED',
          entityType: 'EvidenceFile',
          entityId: evidence._id,
          beforeState: null,
          afterState: evidence.toObject()
        }
      : null;

    return created(res, { data: evidence, message: t('evidence.uploaded', lang) });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function getSignedUrl(req, res, next) {
  try {
    const { evidence, signedUrl } = await evidenceService.getSignedEvidenceUrl(req.params.id);
    return success(res, { data: { evidence, signedUrl } });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function remove(req, res, next) {
  try {
    const evidence = await evidenceService.deleteEvidence(req.params.id);
    res.locals.auditEntry = {
      action: 'EVIDENCE_DELETED',
      entityType: 'EvidenceFile',
      entityId: evidence._id,
      beforeState: evidence.toObject(),
      afterState: null
    };
    return success(res, { data: null });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { upload, getSignedUrl, remove };
