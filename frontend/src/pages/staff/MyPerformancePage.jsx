import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import KpiCard from '../../components/analytics/KpiCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COMPLAINT_STATUS } from '../../utils/constants';

export default function MyPerformancePage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listComplaints({ limit: 100 })
      .then(({ data }) => setComplaints(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = complaints.length;
  const resolved = complaints.filter((c) => [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED].includes(c.status));
  const ratings = resolved.map((c) => c.feedback?.rating).filter(Boolean);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';

  const resolutionDays = resolved
    .filter((c) => c.resolvedAt)
    .map((c) => (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
  const avgResolution = resolutionDays.length
    ? (resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length).toFixed(1)
    : '—';

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.staffPerformance')}</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('analytics.totalAssigned')} value={total} />
        <KpiCard label={t('analytics.totalResolved')} value={resolved.length} accent="moss" />
        <KpiCard label={t('analytics.avgResolutionDays')} value={avgResolution} />
        <KpiCard label={t('analytics.avgRating')} value={avgRating} accent="rust" />
      </div>
    </div>
  );
}
