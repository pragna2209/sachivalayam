import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAnalyticsSummary, getAnalyticsByCategory, getAnalyticsByGeo, getResolutionTime } from '../../api/analyticsApi';
import KpiCard from '../../components/analytics/KpiCard';
import CategoryChart from '../../components/analytics/CategoryChart';
import GeoBreakdownChart from '../../components/analytics/GeoBreakdownChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AnalyticsDashboardPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byGeo, setByGeo] = useState([]);
  const [resolutionTime, setResolutionTime] = useState(null);
  const [geoLevel, setGeoLevel] = useState('district');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    const params = { startDate: startDate || undefined, endDate: endDate || undefined };
    setLoading(true);
    Promise.all([
      getAnalyticsSummary(params),
      getAnalyticsByCategory(params),
      getAnalyticsByGeo({ ...params, level: geoLevel }),
      getResolutionTime(params)
    ])
      .then(([sumRes, catRes, geoRes, resRes]) => {
        setSummary(sumRes.data.data);
        setByCategory(catRes.data.data);
        setByGeo(geoRes.data.data);
        setResolutionTime(resRes.data.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [geoLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('analytics.title')}</h1>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label-eyebrow">{t('analytics.startDate')}</label>
          <input type="date" className="input-field mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label-eyebrow">{t('analytics.endDate')}</label>
          <input type="date" className="input-field mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button type="button" onClick={load} className="btn-secondary">{t('analytics.applyFilters')}</button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label={t('dashboard.totalComplaints')} value={summary?.totalComplaints ?? 0} />
            <KpiCard label={t('dashboard.openComplaints')} value={summary?.openComplaints ?? 0} accent="rust" />
            <KpiCard label={t('dashboard.resolvedComplaints')} value={summary?.resolvedComplaints ?? 0} accent="moss" />
            <KpiCard label={t('nav.escalations')} value={summary?.escalatedComplaints ?? 0} accent="rust" />
            <KpiCard label={t('analytics.avgResolutionDays')} value={resolutionTime?.avgResolutionDays?.toFixed(1) ?? '—'} />
          </div>

          <div className="mt-8 card">
            <h2 className="font-display text-lg font-semibold">{t('analytics.byCategory')}</h2>
            <div className="mt-4"><CategoryChart data={byCategory} /></div>
          </div>

          <div className="mt-8 card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{t('analytics.byGeography')}</h2>
              <select className="input-field max-w-[160px]" value={geoLevel} onChange={(e) => setGeoLevel(e.target.value)}>
                <option value="district">{t('common.district')}</option>
                <option value="mandal">{t('common.mandal')}</option>
                <option value="village">{t('common.village')}</option>
              </select>
            </div>
            <div className="mt-4"><GeoBreakdownChart data={byGeo} /></div>
          </div>
        </>
      )}
    </div>
  );
}
