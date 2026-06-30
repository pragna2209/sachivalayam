const reportsService = require('./reports.service');
const { t, resolveLanguage } = require('../../i18n');
const { failure } = require('../../utils/apiResponse');

function translateKnownError(err, req) {
  if (err && err.isOperational && typeof err.message === 'string') {
    err.message = t(err.message, resolveLanguage(req));
  }
  return err;
}

async function exportReport(req, res, next) {
  try {
    const { type, format } = req.query;
    const rows = await reportsService.getReportRows({
      type,
      jurisdictionFilter: req.jurisdictionFilter,
      query: req.query
    });

    const filenameBase = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
      const doc = reportsService.generatePdfStream(rows, `${type} report`);
      doc.pipe(res);
      return undefined;
    }

    const csv = reportsService.generateCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    return next(translateKnownError(err, req));
  }
}

module.exports = { exportReport };
