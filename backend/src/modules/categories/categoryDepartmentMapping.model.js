const mongoose = require('mongoose');

const { Schema } = mongoose;

const categoryDepartmentMappingSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    isPrimary: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categoryDepartmentMappingSchema.index({ categoryId: 1 });
categoryDepartmentMappingSchema.index({ departmentId: 1 });
categoryDepartmentMappingSchema.index({ categoryId: 1, departmentId: 1 }, { unique: true });

module.exports = mongoose.model('CategoryDepartmentMapping', categoryDepartmentMappingSchema);
