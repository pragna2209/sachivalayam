const User = require('./users.model');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { NotFoundError } = require('../../utils/appError');
const { ROLES } = require('../../config/constants');

async function getProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new NotFoundError('auth.userNotFound');
  }
  return user;
}

async function updateProfile(userId, payload) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('auth.userNotFound');
  }
  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email;
  if (payload.preferredLanguage !== undefined) user.preferredLanguage = payload.preferredLanguage;
  if (payload.address !== undefined) {
    user.address = { ...(user.address ? user.address.toObject() : {}), ...payload.address };
  }
  await user.save();
  return user;
}

async function listCitizens({ isActive, search, page, limit }) {
  const filter = { role: ROLES.CITIZEN };
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

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

async function setCitizenStatus(id, isActive) {
  const user = await User.findOne({ _id: id, role: ROLES.CITIZEN });
  if (!user) {
    throw new NotFoundError('auth.userNotFound');
  }
  user.isActive = isActive;
  await user.save();
  return user;
}

module.exports = { getProfile, updateProfile, listCitizens, setCitizenStatus };
