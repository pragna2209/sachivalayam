const mongoose = require('mongoose');

const { Schema } = mongoose;

const systemSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, trim: true, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

// key uniqueness is enforced via the field-level `unique: true` above.

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
