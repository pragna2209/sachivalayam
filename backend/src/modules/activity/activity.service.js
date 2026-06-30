const ActivityLog = require('./activity.model');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

async function recordActivity({ userId, action, metadata }) {
  return ActivityLog.create({ userId, action, metadata: metadata || {} });
}

async function listActivityLogs({ userId, action, page, limit }) {
  const filter = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;

  const { skip } = parsePagination({ page, limit });
  const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, totalCount] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('userId', 'name role phoneNumber')
      .lean(),
    ActivityLog.countDocuments(filter)
  ]);

  return {
    items,
    meta: buildPaginationMeta({ page: parseInt(page, 10) || 1, limit: safeLimit, totalCount })
  };
}

module.exports = { recordActivity, listActivityLogs };
