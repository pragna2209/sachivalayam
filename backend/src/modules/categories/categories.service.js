const Category = require('./categories.model');
const CategoryDepartmentMapping = require('./categoryDepartmentMapping.model');
const { NotFoundError, ConflictError } = require('../../utils/appError');

async function listCategories({ isSensitive, isActive } = {}) {
  const filter = {};
  if (isSensitive !== undefined) filter.isSensitive = isSensitive;
  if (isActive !== undefined) filter.isActive = isActive;
  else filter.isActive = true;
  return Category.find(filter).sort({ displayOrder: 1, 'name.en': 1 }).lean();
}

async function getCategoryById(id) {
  const category = await Category.findById(id).lean();
  if (!category) {
    throw new NotFoundError('category.notFound');
  }
  return category;
}

async function createCategory(payload) {
  return Category.create(payload);
}

async function updateCategory(id, payload) {
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('category.notFound');
  }
  Object.assign(category, payload);
  await category.save();
  return category;
}

async function listMappings({ categoryId, departmentId } = {}) {
  const filter = {};
  if (categoryId) filter.categoryId = categoryId;
  if (departmentId) filter.departmentId = departmentId;
  return CategoryDepartmentMapping.find(filter)
    .populate('categoryId', 'name code')
    .populate('departmentId', 'name')
    .lean();
}

async function createMapping({ categoryId, departmentId, isPrimary }) {
  const existing = await CategoryDepartmentMapping.findOne({ categoryId, departmentId });
  if (existing) {
    throw new ConflictError('This category-department mapping already exists');
  }
  return CategoryDepartmentMapping.create({ categoryId, departmentId, isPrimary: isPrimary !== false });
}

async function updateMapping(id, payload) {
  const mapping = await CategoryDepartmentMapping.findById(id);
  if (!mapping) {
    throw new NotFoundError('Mapping not found');
  }
  Object.assign(mapping, payload);
  await mapping.save();
  return mapping;
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  listMappings,
  createMapping,
  updateMapping
};
