const mongoose = require('mongoose');
const { CATEGORY_CODES } = require('../../config/constants');

const { Schema } = mongoose;

const multilingualTextSchema = new Schema(
  {
    te: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const slaOverrideSchema = new Schema(
  {
    assignment: { type: Number, default: null },
    resolution: { type: Number, default: null }
  },
  { _id: false }
);

const categorySchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      enum: CATEGORY_CODES,
      uppercase: true,
      trim: true
    },
    name: { type: multilingualTextSchema, required: true },
    isSensitive: { type: Boolean, default: false },
    defaultDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    slaOverrideDays: { type: slaOverrideSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

categorySchema.index({ isSensitive: 1, isActive: 1 });
// code uniqueness is enforced via the field-level `unique: true` above.

module.exports = mongoose.model('Category', categorySchema);
