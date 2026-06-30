const mongoose = require('mongoose');
const { ALL_ROLES } = require('../../config/constants');

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: ALL_ROLES, required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    beforeState: { type: Schema.Types.Mixed, default: null },
    afterState: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: '' }
  },
  { timestamps: true }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

// Deliberately no pre-remove/pre-update hooks needed: this collection is
// never exposed via an update or delete route anywhere in the API surface
// (see audit.routes.js) - it is append-only by construction.

module.exports = mongoose.model('AuditLog', auditLogSchema);
