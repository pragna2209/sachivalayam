const fs = require('fs');
const EvidenceFile = require('./evidence.model');
const Complaint = require('../complaints/complaints.model');
const { uploadToStorage, deleteFromStorage, getSignedUrl } = require('../../config/storage');
const { NotFoundError, ForbiddenError } = require('../../utils/appError');
const { FILE_TYPE } = require('../../config/constants');
const logger = require('../../utils/logger');

const RESOURCE_TYPE_BY_CATEGORY = {
  [FILE_TYPE.IMAGE]: 'image',
  [FILE_TYPE.VIDEO]: 'video',
  [FILE_TYPE.DOCUMENT]: 'raw'
};

/**
 * Uploads an already-validated (content-sniffed, size-checked) local file
 * to object storage, persists the metadata record, and removes the local
 * temp file regardless of outcome. The complaint document itself is
 * never touched here - it stores only evidenceFileIds inside individual
 * timeline events, attached by the complaints service when a status
 * update references this file.
 */
async function uploadEvidence({ complaintId, file, uploadedBy, uploaderRole, uploadedAtStage }) {
  const complaint = await Complaint.findById(complaintId).lean();
  if (!complaint) {
    throw new NotFoundError('complaint.notFound');
  }

  const resourceType = RESOURCE_TYPE_BY_CATEGORY[file.detectedCategory] || 'raw';

  let storageResult;
  try {
    storageResult = await uploadToStorage(file.path, {
      folder: `sachivalayam/complaints/${complaintId}`,
      resourceType
    });
  } finally {
    fs.unlink(file.path, () => {});
  }

  const evidence = await EvidenceFile.create({
    complaintId,
    uploadedBy: uploadedBy || null,
    uploaderRole,
    fileType: file.detectedCategory,
    originalFileName: file.originalname,
    mimeType: file.detectedMimeType,
    sizeBytes: file.size,
    storageUrl: storageResult.storageUrl,
    storageKey: storageResult.storageKey,
    uploadedAtStage: uploadedAtStage || complaint.status
  });

  return evidence;
}

/**
 * Returns a short-lived signed URL for viewing an evidence file - never a
 * permanent public link (Section 9.4). Caller (controller/route) is
 * responsible for jurisdiction/ownership checks before calling this.
 */
async function getSignedEvidenceUrl(evidenceId) {
  const evidence = await EvidenceFile.findById(evidenceId).lean();
  if (!evidence) {
    throw new NotFoundError('evidence.notFound');
  }
  const resourceType = RESOURCE_TYPE_BY_CATEGORY[evidence.fileType] || 'raw';
  const signedUrl = getSignedUrl(evidence.storageKey, resourceType);
  return { evidence, signedUrl };
}

async function deleteEvidence(evidenceId) {
  const evidence = await EvidenceFile.findById(evidenceId);
  if (!evidence) {
    throw new NotFoundError('evidence.notFound');
  }
  const resourceType = RESOURCE_TYPE_BY_CATEGORY[evidence.fileType] || 'raw';
  try {
    await deleteFromStorage(evidence.storageKey, resourceType);
  } catch (err) {
    logger.error('Failed to delete file from object storage', { error: err.message, evidenceId });
  }
  await EvidenceFile.deleteOne({ _id: evidenceId });
  return evidence;
}

async function listEvidenceForComplaint(complaintId) {
  return EvidenceFile.find({ complaintId }).sort({ createdAt: 1 }).lean();
}

module.exports = { uploadEvidence, getSignedEvidenceUrl, deleteEvidence, listEvidenceForComplaint };
