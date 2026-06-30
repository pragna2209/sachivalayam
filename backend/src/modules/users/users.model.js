const mongoose = require('mongoose');
const { ROLES, ALL_ROLES, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } = require('../../config/constants');

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    pincode: { type: String, trim: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'District' },
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal' },
    villageId: { type: Schema.Types.ObjectId, ref: 'Village' },
    sachivalayamId: { type: Schema.Types.ObjectId, ref: 'Sachivalayam' }
  },
  { _id: false }
);

const jurisdictionSchema = new Schema(
  {
    districtId: { type: Schema.Types.ObjectId, ref: 'District' },
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal' },
    sachivalayamId: { type: Schema.Types.ObjectId, ref: 'Sachivalayam' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ALL_ROLES,
      required: true,
      default: ROLES.CITIZEN
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
    },
    aadhaarNumber: {
      // Plain identifier field only - NOT used for UIDAI eKYC verification,
      // per the locked architecture assumption (phone+OTP is the real credential).
      type: String,
      trim: true,
      match: [/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'],
      default: null
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
    },
    // Optional - phone+OTP remains the baseline credential for every
    // account (Section 9.1 of the architecture). A password is an
    // additional, optional login path: null until the user either sets
    // one (from their profile) or registers with one chosen up front.
    // Never returned to the client - see toSafeJSON() below.
    passwordHash: { type: String, default: null, select: false },
    preferredLanguage: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: DEFAULT_LANGUAGE
    },
    isActive: { type: Boolean, default: true },

    address: { type: addressSchema, default: undefined },
    jurisdiction: { type: jurisdictionSchema, default: undefined },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.index({ role: 1, 'jurisdiction.sachivalayamId': 1 });
userSchema.index({ role: 1, 'jurisdiction.mandalId': 1 });
userSchema.index({ role: 1, 'jurisdiction.districtId': 1 });
userSchema.index({ 'address.sachivalayamId': 1 });

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.__v;
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
