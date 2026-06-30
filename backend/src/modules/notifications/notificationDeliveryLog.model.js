const mongoose = require('mongoose');
const { NOTIFICATION_CHANNEL, DELIVERY_STATUS } = require('../../config/constants');

const { Schema } = mongoose;

const notificationDeliveryLogSchema = new Schema(
  {
    notificationId: { type: Schema.Types.ObjectId, ref: 'Notification', required: true },
    channel: { type: String, enum: Object.values(NOTIFICATION_CHANNEL), required: true },
    providerName: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(DELIVERY_STATUS), required: true },
    providerResponse: { type: String, default: '' },
    attemptedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

notificationDeliveryLogSchema.index({ notificationId: 1 });

module.exports = mongoose.model('NotificationDeliveryLog', notificationDeliveryLogSchema);
