import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportReport } from '../../api/analyticsApi';

const REPORT_TYPES = ['resolution-time', 'staff-performance', 'by-category', 'by-geo', 'complaints'];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [type, setType] = useState('complaints');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport(format) {
    setError('');
    setDownloading(true);
    try {
      const { data } = await exportReport({
        type,
        format,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      const blob = new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(t('common.somethingWentWrong'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.reports')}</h1>

      <div className="mt-6 card max-w-lg space-y-4">
        <div>
          <label className="label-eyebrow">Report type</label>
          <select className="input-field mt-1" value={type} onChange={(e) => setType(e.target.value)}>
            {REPORT_TYPES.map((rt) => (
              <option key={rt} value={rt}>{rt.replace(/-/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-eyebrow">{t('analytics.startDate')}</label>
            <input type="date" className="input-field mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label-eyebrow">{t('analytics.endDate')}</label>
            <input type="date" className="input-field mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-rust-500">{error}</p>}

        <div className="flex gap-3">
          <button type="button" disabled={downloading} onClick={() => handleExport('csv')} className="btn-secondary">
            {t('analytics.exportCsv')}
          </button>
          <button type="button" disabled={downloading} onClick={() => handleExport('pdf')} className="btn-secondary">
            {t('analytics.exportPdf')}
          </button>
        </div>
      </div>
    </div>
  );
}
