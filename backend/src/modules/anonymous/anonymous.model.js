const mongoose = require('mongoose');

const { Schema } = mongoose;

const optionalContactChannelSchema = new Schema(
  {
    type: { type: String, enum: ['EMAIL', 'SMS', null], default: null },
    value: { type: String, default: null, trim: true }
  },
  { _id: false }
);

const anonymousComplainantCredentialsSchema = new Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    pinHash: { type: String, required: true },
    optionalContactChannel: { type: optionalContactChannelSchema, default: () => ({}) }
  },
  { timestamps: true }
);

// trackingId uniqueness is enforced via the field-level `unique: true` above.

module.exports = mongoose.model('AnonymousComplainantCredentials', anonymousComplainantCredentialsSchema);
