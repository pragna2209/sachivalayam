const Department = require('./departments.model');
const { NotFoundError } = require('../../utils/appError');

async function listDepartments({ isActive } = {}) {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;
  else filter.isActive = true;
  return Department.find(filter).sort({ 'name.en': 1 }).lean();
}

async function getDepartmentById(id) {
  const department = await Department.findById(id).lean();
  if (!department) {
    throw new NotFoundError('department.notFound');
  }
  return department;
}

async function createDepartment(payload) {
  return Department.create(payload);
}

async function updateDepartment(id, payload) {
  const department = await Department.findById(id);
  if (!department) {
    throw new NotFoundError('department.notFound');
  }
  if (payload.name) department.name = { ...department.name.toObject(), ...payload.name };
  if (payload.description) department.description = { ...department.description.toObject(), ...payload.description };
  if (payload.isActive !== undefined) department.isActive = payload.isActive;
  await department.save();
  return department;
}

module.exports = { listDepartments, getDepartmentById, createDepartment, updateDepartment };
