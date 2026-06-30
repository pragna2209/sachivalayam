const analyticsService = require('./analytics.service');
const { success } = require('../../utils/apiResponse');
const { t, resolveLanguage } = require('../../i18n');
const { BadRequestError } = require('../../utils/appError');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function summary(req, res, next) {
  try {
    const data = await analyticsService.getSummary({ jurisdictionFilter: req.jurisdictionFilter, query: req.query });
    return success(res, { data });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function byCategory(req, res, next) {
  try {
    const data = await analyticsService.getByCategory({ jurisdictionFilter: req.jurisdictionFilter, query: req.query });
    return success(res, { data });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function byGeo(req, res, next) {
  try {
    const level = req.query.level || 'district';
    if (!['district', 'mandal', 'village', 'sachivalayam'].includes(level)) {
      throw new BadRequestError('Invalid geo level');
    }
    const data = await analyticsService.getByGeo({ jurisdictionFilter: req.jurisdictionFilter, query: req.query, level });
    return success(res, { data });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function staffPerformance(req, res, next) {
  try {
    const data = await analyticsService.getStaffPerformance({
      jurisdictionFilter: req.jurisdictionFilter,
      query: req.query
    });
    return success(res, { data });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

async function resolutionTime(req, res, next) {
  try {
    const data = await analyticsService.getResolutionTimeStats({
      jurisdictionFilter: req.jurisdictionFilter,
      query: req.query
    });
    return success(res, { data });
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { summary, byCategory, byGeo, staffPerformance, resolutionTime };
