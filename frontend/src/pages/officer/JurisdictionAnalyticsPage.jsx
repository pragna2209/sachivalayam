import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAnalyticsByCategory, getAnalyticsByGeo, getResolutionTime } from '../../api/analyticsApi';
import CategoryChart from '../../components/analytics/CategoryChart';
import GeoBreakdownChart from '../../components/analytics/GeoBreakdownChart';
import KpiCard from '../../components/analytics/KpiCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function JurisdictionAnalyticsPage() {
  const { t } = useTranslation();
  const [byCategory, setByCategory] = useState([]);
  const [byGeo, setByGeo] = useState([]);
  const [resolutionTime, setResolutionTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyticsByCategory({}),
      getAnalyticsByGeo({ level: 'village' }),
      getResolutionTime({})
    ])
      .then(([catRes, geoRes, resRes]) => {
        setByCategory(catRes.data.data);
        setByGeo(geoRes.data.data);
        setResolutionTime(resRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('analytics.title')}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label={t('analytics.avgResolutionDays')} value={resolutionTime?.avgResolutionDays?.toFixed(1) ?? '—'} />
        <KpiCard label="Fastest" value={resolutionTime?.minResolutionDays?.toFixed(1) ?? '—'} accent="moss" />
        <KpiCard label="Slowest" value={resolutionTime?.maxResolutionDays?.toFixed(1) ?? '—'} accent="rust" />
      </div>

      <div className="mt-8 card">
        <h2 className="font-display text-lg font-semibold">{t('analytics.byCategory')}</h2>
        <div className="mt-4">
          <CategoryChart data={byCategory} />
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="font-display text-lg font-semibold">{t('analytics.byGeography')}</h2>
        <div className="mt-4">
          <GeoBreakdownChart data={byGeo} />
        </div>
      </div>
    </div>
  );
}
