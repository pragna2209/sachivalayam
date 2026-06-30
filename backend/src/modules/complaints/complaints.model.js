const mongoose = require('mongoose');
const {
  COMPLAINT_STATUS,
  ESCALATION_LEVEL,
  ESCALATION_TRIGGER,
  ALL_ROLES
} = require('../../config/constants');

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: [/^[0-9]{6}$/, 'Pincode must be 6 digits'] }
  },
  { _id: false }
);

const gpsLocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: 'coordinates must be an array of [longitude, latitude]'
      }
    }
  },
  { _id: false }
);

const timelineEventSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    status: { type: String, enum: Object.values(COMPLAINT_STATUS), required: true },
    remark: { type: String, trim: true, default: '' },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, enum: [...ALL_ROLES, 'SYSTEM', 'ANONYMOUS'], required: true },
    evidenceFileIds: [{ type: Schema.Types.ObjectId, ref: 'EvidenceFile' }],
    occurredAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const escalationRecordSchema = new Schema(
  {
    escalationId: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    level: { type: String, enum: Object.values(ESCALATION_LEVEL), required: true },
    escalatedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true, default: '' },
    triggeredAt: { type: Date, default: Date.now },
    triggeredBy: { type: String, enum: Object.values(ESCALATION_TRIGGER), required: true },
    resolvedFlag: { type: Boolean, default: false }
  },
  { _id: false }
);

const feedbackSchema = new Schema(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: '' },
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const complaintSchema = new Schema(
  {
    complaintNumber: { type: String, required: true, unique: true, trim: true },

    // Identity - exactly one pattern populated.
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isAnonymous: { type: Boolean, default: false },
    anonymousTrackingId: { type: String, default: null, trim: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },

    address: { type: addressSchema, required: true },
    gpsLocation: { type: gpsLocationSchema, required: true },
    mapLocationLabel: { type: String, trim: true, default: '' },
    districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true },
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal', required: true },
    villageId: { type: Schema.Types.ObjectId, ref: 'Village', required: true },
    sachivalayamId: { type: Schema.Types.ObjectId, ref: 'Sachivalayam', required: true },

    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.REGISTERED
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    reopenCount: { type: Number, default: 0 },
    reopenDeadline: { type: Date, default: null },

    relatedComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', default: null },

    timeline: { type: [timelineEventSchema], default: [] },
    escalations: { type: [escalationRecordSchema], default: [] },
    feedback: { type: feedbackSchema, default: null }
  },
  { timestamps: true }
);

// --- Indexes (Section 7.2 of approved architecture) ---
// complaintNumber uniqueness is enforced via the field-level `unique: true` above.
complaintSchema.index({ citizenId: 1, createdAt: -1 });
complaintSchema.index({ anonymousTrackingId: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ sachivalayamId: 1, status: 1 });
complaintSchema.index({ mandalId: 1, status: 1 });
complaintSchema.index({ districtId: 1, status: 1 });
complaintSchema.index({ categoryId: 1, status: 1 });
complaintSchema.index({ gpsLocation: '2dsphere' });
complaintSchema.index({ 'escalations.level': 1, 'escalations.resolvedFlag': 1 });
complaintSchema.index({ assignedAt: 1, status: 1 });
complaintSchema.index({ createdAt: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
