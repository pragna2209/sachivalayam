const mongoose = require('mongoose');

const { Schema } = mongoose;

const multilingualTextSchema = new Schema(
  {
    te: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const departmentSchema = new Schema(
  {
    name: { type: multilingualTextSchema, required: true },
    description: { type: multilingualTextSchema, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
