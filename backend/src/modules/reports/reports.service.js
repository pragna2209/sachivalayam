const { Parser: CsvParser } = require('json2csv');
const PDFDocument = require('pdfkit');
const analyticsService = require('../analytics/analytics.service');
const Complaint = require('../complaints/complaints.model');
const { BadRequestError } = require('../../utils/appError');

/**
 * Fetches the rows for the requested report type, reusing the exact same
 * aggregation pipelines as the live analytics dashboard (Section 8.10 /
 * 13: reports are not a separately-maintained code path, they format the
 * same underlying data differently).
 */
async function getReportRows({ type, jurisdictionFilter, query }) {
  switch (type) {
    case 'resolution-time': {
      const stats = await analyticsService.getResolutionTimeStats({ jurisdictionFilter, query });
      return [stats];
    }
    case 'staff-performance':
      return analyticsService.getStaffPerformance({ jurisdictionFilter, query });
    case 'by-category':
      return analyticsService.getByCategory({ jurisdictionFilter, query });
    case 'by-geo':
      return analyticsService.getByGeo({ jurisdictionFilter, query, level: query.level || 'district' });
    case 'complaints': {
      const filter = { ...jurisdictionFilter };
      if (query.districtId) filter.districtId = query.districtId;
      if (query.mandalId) filter.mandalId = query.mandalId;
      if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
        if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
      }
      return Complaint.find(filter)
        .select('complaintNumber title status createdAt resolvedAt districtId mandalId')
        .limit(5000) // hard ceiling to keep export generation bounded
        .lean();
    }
    default:
      throw new BadRequestError('Unsupported report type');
  }
}

function generateCsv(rows) {
  if (!rows || rows.length === 0) {
    return 'No data available for the selected filters\n';
  }
  const parser = new CsvParser();
  return parser.parse(rows);
}

/**
 * Streams a simple tabular PDF report. Kept intentionally plain (no
 * branding/letterhead) - this is an operational export for officers/admin,
 * not a citizen-facing document.
 */
function generatePdfStream(rows, title) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.fontSize(16).text(title, { underline: true });
  doc.moveDown();

  if (!rows || rows.length === 0) {
    doc.fontSize(11).text('No data available for the selected filters.');
    doc.end();
    return doc;
  }

  const columns = Object.keys(rows[0]);
  doc.fontSize(9);

  rows.forEach((row, index) => {
    if (index > 0 && index % 30 === 0) {
      doc.addPage();
    }
    const line = columns.map((col) => `${col}: ${formatCell(row[col])}`).join('  |  ');
    doc.text(line, { width: 520 });
    doc.moveDown(0.3);
  });

  doc.end();
  return doc;
}

function formatCell(value) {
  if (value === null || value === undefined) return '-';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

module.exports = { getReportRows, generateCsv, generatePdfStream };
