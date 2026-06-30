const auditService = require('../audit/audit.service');
const { success } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const result = await auditService.listAuditLogs(req.query);
    return success(res, { data: result.items, meta: result.meta });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list };
