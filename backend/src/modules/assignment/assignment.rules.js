const Category = require('../categories/categories.model');
const CategoryDepartmentMapping = require('../categories/categoryDepartmentMapping.model');
const User = require('../users/users.model');
const { ROLES } = require('../../config/constants');

/**
 * Resolves which Department a complaint belongs to, using the primary
 * category-department mapping if one exists, falling back to the
 * category's own defaultDepartmentId otherwise.
 */
async function resolveDepartmentForCategory(categoryId) {
  const primaryMapping = await CategoryDepartmentMapping.findOne({ categoryId, isPrimary: true }).lean();
  if (primaryMapping) {
    return primaryMapping.departmentId;
  }
  const category = await Category.findById(categoryId).lean();
  return category ? category.defaultDepartmentId : null;
}

/**
 * Finds the Sachivalayam Staff member responsible for a given
 * Sachivalayam + Department combination. Returns null if none is mapped -
 * the caller (assignment.service.js) is responsible for triggering the
 * NO_STAFF_MAPPED fallback escalation in that case (Section 11.3).
 */
async function findStaffForSachivalayamAndDepartment({ sachivalayamId, departmentId }) {
  const staff = await User.findOne({
    role: ROLES.SACHIVALAYAM_STAFF,
    isActive: true,
    'jurisdiction.sachivalayamId': sachivalayamId,
    'jurisdiction.departmentId': departmentId
  }).lean();
  return staff;
}

async function findMandalOfficer(mandalId) {
  return User.findOne({
    role: ROLES.MANDAL_OFFICER,
    isActive: true,
    'jurisdiction.mandalId': mandalId
  }).lean();
}

async function findDistrictOfficer(districtId) {
  return User.findOne({
    role: ROLES.DISTRICT_OFFICER,
    isActive: true,
    'jurisdiction.districtId': districtId
  }).lean();
}

module.exports = {
  resolveDepartmentForCategory,
  findStaffForSachivalayamAndDepartment,
  findMandalOfficer,
  findDistrictOfficer
};
