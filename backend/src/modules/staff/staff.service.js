const User = require('../users/users.model');
const notificationsService = require('../notifications/notifications.service');
const notificationTemplates = require('../notifications/notificationTemplates');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { ConflictError, NotFoundError } = require('../../utils/appError');
const { STAFF_LIKE_ROLES, ROLES, NOTIFICATION_TYPE, NOTIFICATION_CHANNEL } = require('../../config/constants');

async function createStaff({ payload, createdBy }) {
  const existing = await User.findOne({ phoneNumber: payload.phoneNumber }).lean();
  if (existing) {
    throw new ConflictError('auth.phoneAlreadyRegistered');
  }

  const staff = await User.create({
    role: payload.role,
    phoneNumber: payload.phoneNumber,
    name: payload.name,
    email: payload.email,
    preferredLanguage: payload.preferredLanguage || 'en',
    jurisdiction: payload.jurisdiction,
    isActive: true,
    createdBy
  });

  const content = notificationTemplates.staffAccountCreated(staff.name);
  await notificationsService.dispatch({
    recipient: { userId: staff._id, email: staff.email, phoneNumber: staff.phoneNumber },
    complaintId: null,
    type: NOTIFICATION_TYPE.SYSTEM,
    content,
    channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL]
  });

  return staff;
}

async function listStaff({ role, districtId, mandalId, sachivalayamId, departmentId, page, limit }) {
  const filter = { role: { $in: [...STAFF_LIKE_ROLES, ROLES.ADMIN] } };
  if (role) filter.role = role;
  if (districtId) filter['jurisdiction.districtId'] = districtId;
  if (mandalId) filter['jurisdiction.mandalId'] = mandalId;
  if (sachivalayamId) filter['jurisdiction.sachivalayamId'] = sachivalayamId;
  if (departmentId) filter['jurisdiction.departmentId'] = departmentId;

  const { skip } = parsePagination({ page, limit });
  const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, totalCount] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    User.countDocuments(filter)
  ]);

  return {
    items,
    meta: buildPaginationMeta({ page: parseInt(page, 10) || 1, limit: safeLimit, totalCount })
  };
}

async function getStaffById(id) {
  const staff = await User.findOne({ _id: id, role: { $in: [...STAFF_LIKE_ROLES, ROLES.ADMIN] } }).lean();
  if (!staff) {
    throw new NotFoundError('staff.notFound');
  }
  return staff;
}

async function updateStaff(id, payload) {
  const staff = await User.findOne({ _id: id, role: { $in: [...STAFF_LIKE_ROLES, ROLES.ADMIN] } });
  if (!staff) {
    throw new NotFoundError('staff.notFound');
  }
  if (payload.name !== undefined) staff.name = payload.name;
  if (payload.email !== undefined) staff.email = payload.email;
  if (payload.preferredLanguage !== undefined) staff.preferredLanguage = payload.preferredLanguage;
  if (payload.role !== undefined) staff.role = payload.role;
  if (payload.jurisdiction !== undefined) {
    staff.jurisdiction = { ...(staff.jurisdiction ? staff.jurisdiction.toObject() : {}), ...payload.jurisdiction };
  }
  await staff.save();
  return staff;
}

async function setStaffStatus(id, isActive) {
  const staff = await User.findOne({ _id: id, role: { $in: [...STAFF_LIKE_ROLES, ROLES.ADMIN] } });
  if (!staff) {
    throw new NotFoundError('staff.notFound');
  }
  staff.isActive = isActive;
  await staff.save();
  return staff;
}

module.exports = { createStaff, listStaff, getStaffById, updateStaff, setStaffStatus };
