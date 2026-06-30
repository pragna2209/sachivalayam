const mongoose = require('mongoose');
const Complaint = require('../complaints/complaints.model');
const { COMPLAINT_STATUS, OPEN_STATUSES, TERMINAL_STATUSES } = require('../../config/constants');

function buildBaseFilter({ jurisdictionFilter, query }) {
  const filter = { ...jurisdictionFilter };
  if (query.districtId) filter.districtId = new mongoose.Types.ObjectId(query.districtId);
  if (query.mandalId) filter.mandalId = new mongoose.Types.ObjectId(query.mandalId);
  if (query.villageId) filter.villageId = new mongoose.Types.ObjectId(query.villageId);
  if (query.sachivalayamId) filter.sachivalayamId = new mongoose.Types.ObjectId(query.sachivalayamId);
  if (query.categoryId) filter.categoryId = new mongoose.Types.ObjectId(query.categoryId);
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  return filter;
}

/**
 * Top-level KPI summary: total / open / closed counts, scoped to the
 * caller's jurisdiction (Section 8.10 - GET /analytics/summary).
 */
async function getSummary({ jurisdictionFilter, query }) {
  const filter = buildBaseFilter({ jurisdictionFilter, query });

  const [totalCount, openCount, closedCount, resolvedCount, escalatedCount] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.countDocuments({ ...filter, status: { $in: OPEN_STATUSES } }),
    Complaint.countDocuments({ ...filter, status: COMPLAINT_STATUS.CLOSED }),
    Complaint.countDocuments({ ...filter, status: COMPLAINT_STATUS.RESOLVED }),
    Complaint.countDocuments({ ...filter, 'escalations.0': { $exists: true } })
  ]);

  return {
    totalComplaints: totalCount,
    openComplaints: openCount,
    closedComplaints: closedCount,
    resolvedComplaints: resolvedCount,
    escalatedComplaints: escalatedCount
  };
}

/**
 * Category-wise breakdown (Section 8.10 - GET /analytics/by-category).
 */
async function getByCategory({ jurisdictionFilter, query }) {
  const filter = buildBaseFilter({ jurisdictionFilter, query });

  return Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$categoryId',
        totalCount: { $sum: 1 },
        openCount: { $sum: { $cond: [{ $in: ['$status', OPEN_STATUSES] }, 1, 0] } },
        closedCount: { $sum: { $cond: [{ $eq: ['$status', COMPLAINT_STATUS.CLOSED] }, 1, 0] } }
      }
    },
    {
      $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' }
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        categoryName: '$category.name',
        totalCount: 1,
        openCount: 1,
        closedCount: 1
      }
    },
    { $sort: { totalCount: -1 } }
  ]);
}

/**
 * Geo breakdown (district/mandal/village) - Section 8.10 GET /analytics/by-geo.
 * `level` determines which geo field to group by.
 */
async function getByGeo({ jurisdictionFilter, query, level }) {
  const filter = buildBaseFilter({ jurisdictionFilter, query });
  const groupField = `$${level}Id`;
  const collectionByLevel = { district: 'districts', mandal: 'mandals', village: 'villages', sachivalayam: 'sachivalayams' };

  return Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: groupField,
        totalCount: { $sum: 1 },
        openCount: { $sum: { $cond: [{ $in: ['$status', OPEN_STATUSES] }, 1, 0] } },
        closedCount: { $sum: { $cond: [{ $eq: ['$status', COMPLAINT_STATUS.CLOSED] }, 1, 0] } }
      }
    },
    {
      $lookup: { from: collectionByLevel[level], localField: '_id', foreignField: '_id', as: 'geo' }
    },
    { $unwind: { path: '$geo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        geoId: '$_id',
        geoName: '$geo.name',
        totalCount: 1,
        openCount: 1,
        closedCount: 1
      }
    },
    { $sort: { totalCount: -1 } }
  ]);
}

/**
 * Staff performance - resolution counts, average resolution time, average
 * citizen rating per staff member (Section 8.10 GET /analytics/staff-performance).
 * Restricted to Officer/Admin callers at the route layer.
 */
async function getStaffPerformance({ jurisdictionFilter, query }) {
  const filter = buildBaseFilter({ jurisdictionFilter, query });
  filter.assignedTo = { $ne: null };

  return Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$assignedTo',
        totalAssigned: { $sum: 1 },
        totalResolved: { $sum: { $cond: [{ $in: ['$status', TERMINAL_STATUSES] }, 1, 0] } },
        avgResolutionTimeMs: {
          $avg: {
            $cond: [
              { $ne: ['$resolvedAt', null] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        },
        avgRating: { $avg: '$feedback.rating' }
      }
    },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'staff' }
    },
    { $unwind: '$staff' },
    {
      $project: {
        _id: 0,
        staffId: '$_id',
        staffName: '$staff.name',
        staffRole: '$staff.role',
        totalAssigned: 1,
        totalResolved: 1,
        avgResolutionDays: { $divide: ['$avgResolutionTimeMs', 1000 * 60 * 60 * 24] },
        avgRating: 1
      }
    },
    { $sort: { totalResolved: -1 } }
  ]);
}

/**
 * Overall resolution-time statistics (Section 8.10 GET /analytics/resolution-time).
 */
async function getResolutionTimeStats({ jurisdictionFilter, query }) {
  const filter = buildBaseFilter({ jurisdictionFilter, query });
  filter.resolvedAt = { $ne: null };

  const result = await Complaint.aggregate([
    { $match: filter },
    {
      $project: {
        resolutionTimeDays: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] }
      }
    },
    {
      $group: {
        _id: null,
        avgResolutionDays: { $avg: '$resolutionTimeDays' },
        minResolutionDays: { $min: '$resolutionTimeDays' },
        maxResolutionDays: { $max: '$resolutionTimeDays' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { avgResolutionDays: 0, minResolutionDays: 0, maxResolutionDays: 0, count: 0 };
}

module.exports = { getSummary, getByCategory, getByGeo, getStaffPerformance, getResolutionTimeStats };
