const AuditLog = require('./audit.model');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

/**
 * Writes a single append-only audit entry. There is deliberately no
 * update/delete counterpart anywhere in this service - the audit trail
 * must remain tamper-evident (Section 9.7 of the approved architecture).
 */
async function recordAuditLog({ actorId, actorRole, action, entityType, entityId, beforeState, afterState, ipAddress }) {
  return AuditLog.create({
    actorId,
    actorRole,
    action,
    entityType,
    entityId,
    beforeState: beforeState || null,
    afterState: afterState || null,
    ipAddress: ipAddress || ''
  });
}

async function listAuditLogs({ entityType, entityId, actorId, startDate, endDate, page, limit }) {
  const filter = {};
  if (entityType) filter.entityType = entityType;
  if (entityId) filter.entityId = entityId;
  if (actorId) filter.actorId = actorId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const { skip } = parsePagination({ page, limit });
  const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, totalCount] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('actorId', 'name role phoneNumber')
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  return {
    items,
    meta: buildPaginationMeta({ page: parseInt(page, 10) || 1, limit: safeLimit, totalCount })
  };
}

module.exports = { recordAuditLog, listAuditLogs };
