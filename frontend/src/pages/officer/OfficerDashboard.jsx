import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAnalyticsSummary } from '../../api/analyticsApi';
import { listComplaints } from '../../api/complaintApi';
import KpiCard from '../../components/analytics/KpiCard';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

export default function OfficerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [escalated, setEscalated] = useState([]);
  const [loading, setLoading] = useState(true);

  const jurisdictionLabel = user.role === ROLES.DISTRICT_OFFICER ? t('common.district') : t('common.mandal');

  useEffect(() => {
    Promise.all([getAnalyticsSummary({}), listComplaints({ limit: 50 })])
      .then(([summaryRes, complaintsRes]) => {
        setSummary(summaryRes.data.data);
        setEscalated(complaintsRes.data.data.filter((c) => c.escalations?.length > 0));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('dashboard.officerWelcome', { jurisdiction: jurisdictionLabel })}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('dashboard.totalComplaints')} value={summary?.totalComplaints ?? 0} />
        <KpiCard label={t('dashboard.openComplaints')} value={summary?.openComplaints ?? 0} accent="rust" />
        <KpiCard label={t('dashboard.resolvedComplaints')} value={summary?.resolvedComplaints ?? 0} accent="moss" />
        <KpiCard label={t('nav.escalations')} value={summary?.escalatedComplaints ?? 0} accent="rust" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-rust-500">{t('dashboard.escalatedToMe')}</h2>
        <Link to="/officer/escalations" className="text-sm text-teal-500 hover:underline dark:text-teal-100">
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {escalated.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          escalated.slice(0, 5).map((c) => <ComplaintCard key={c._id} complaint={c} />)
        )}
      </div>
    </div>
  );
}
