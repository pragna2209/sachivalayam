const mongoose = require('mongoose');
const { FILE_TYPE, ALL_ROLES } = require('../../config/constants');

const { Schema } = mongoose;

const evidenceFileSchema = new Schema(
  {
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    uploaderRole: { type: String, enum: [...ALL_ROLES, 'ANONYMOUS'], required: true },
    fileType: { type: String, enum: Object.values(FILE_TYPE), required: true },
    originalFileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storageUrl: { type: String, required: true },
    storageKey: { type: String, required: true },
    uploadedAtStage: { type: String, required: true }
  },
  { timestamps: true }
);

evidenceFileSchema.index({ complaintId: 1 });

module.exports = mongoose.model('EvidenceFile', evidenceFileSchema);
