const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../../config/constants');

const { Schema } = mongoose;

const multilingualTextSchema = new Schema(
  {
    te: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    anonymousTrackingId: { type: String, default: null, trim: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', default: null },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    title: { type: multilingualTextSchema, required: true },
    body: { type: multilingualTextSchema, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ anonymousTrackingId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
