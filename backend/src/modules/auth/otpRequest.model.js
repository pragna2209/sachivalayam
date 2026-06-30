const mongoose = require('mongoose');
const { OTP_PURPOSE } = require('../../config/constants');

const { Schema } = mongoose;

const otpRequestSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
    },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSE),
      required: true
    },
    expiresAt: { type: Date, required: true },
    attemptCount: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

otpRequestSchema.index({ phoneNumber: 1, purpose: 1, createdAt: -1 });
// TTL index: MongoDB automatically deletes the document once expiresAt has passed.
otpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpRequest', otpRequestSchema);
