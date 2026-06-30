const activityService = require('./activity.service');
const { success } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const result = await activityService.listActivityLogs(req.query);
    return success(res, { data: result.items, meta: result.meta });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list };
