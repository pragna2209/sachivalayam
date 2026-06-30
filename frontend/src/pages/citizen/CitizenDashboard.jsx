import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import KpiCard from '../../components/analytics/KpiCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import useAuth from '../../hooks/useAuth';
import { OPEN_STATUSES, COMPLAINT_STATUS } from '../../utils/constants';

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listComplaints({ limit: 5 })
      .then(({ data }) => setComplaints(data.data))
      .finally(() => setLoading(false));
  }, []);

  const openCount = complaints.filter((c) => OPEN_STATUSES.includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === COMPLAINT_STATUS.RESOLVED || c.status === COMPLAINT_STATUS.CLOSED).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('dashboard.citizenWelcome', { name: user?.name })}</h1>
      <p className="mt-1 text-sm text-sand">{t('dashboard.citizenSubtitle')}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label={t('dashboard.totalComplaints')} value={complaints.length} />
        <KpiCard label={t('dashboard.openComplaints')} value={openCount} accent="rust" />
        <KpiCard label={t('dashboard.resolvedComplaints')} value={resolvedCount} accent="moss" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{t('dashboard.recentComplaints')}</h2>
        <Link to="/citizen/complaints" className="text-sm text-teal-500 hover:underline dark:text-teal-100">
          {t('dashboard.viewAll')}
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : complaints.length === 0 ? (
          <EmptyState
            title={t('common.noResults')}
            action={<Link to="/citizen/complaints/new" className="btn-primary">{t('nav.raiseComplaint')}</Link>}
          />
        ) : (
          complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)
        )}
      </div>
    </div>
  );
}
