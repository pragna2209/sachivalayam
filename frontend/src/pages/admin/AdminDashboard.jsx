import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAnalyticsSummary } from '../../api/analyticsApi';
import KpiCard from '../../components/analytics/KpiCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary({})
      .then(({ data }) => setSummary(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('dashboard.adminWelcome')}</h1>
      <p className="mt-1 text-sm text-sand">{t('dashboard.adminSubtitle')}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label={t('dashboard.totalComplaints')} value={summary?.totalComplaints ?? 0} />
        <KpiCard label={t('dashboard.openComplaints')} value={summary?.openComplaints ?? 0} accent="rust" />
        <KpiCard label={t('dashboard.resolvedComplaints')} value={summary?.resolvedComplaints ?? 0} accent="moss" />
        <KpiCard label="Closed" value={summary?.closedComplaints ?? 0} accent="moss" />
        <KpiCard label={t('nav.escalations')} value={summary?.escalatedComplaints ?? 0} accent="rust" />
      </div>
    </div>
  );
}
