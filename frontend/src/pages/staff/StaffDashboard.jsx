import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import useAuth from '../../hooks/useAuth';
import { OPEN_STATUSES } from '../../utils/constants';

const DAY_MS = 24 * 60 * 60 * 1000;

function bucketByUrgency(complaints) {
  const now = Date.now();
  const overdue = [];
  const dueSoon = [];
  const onTrack = [];

  for (const c of complaints) {
    const ageMs = now - new Date(c.createdAt).getTime();
    const ageDays = ageMs / DAY_MS;
    if (ageDays > 7) overdue.push(c);
    else if (ageDays > 4) dueSoon.push(c);
    else onTrack.push(c);
  }
  return { overdue, dueSoon, onTrack };
}

export default function StaffDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listComplaints({ limit: 50 })
      .then(({ data }) => setComplaints(data.data.filter((c) => OPEN_STATUSES.includes(c.status))))
      .finally(() => setLoading(false));
  }, []);

  const { overdue, dueSoon, onTrack } = bucketByUrgency(complaints);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('dashboard.staffWelcome', { name: user?.name })}</h1>
      <p className="mt-1 text-sm text-sand">{t('dashboard.staffSubtitle')}</p>

      {loading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t('common.noResults')} />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <QueueSection title={t('dashboard.overdue')} accent="text-rust-500" items={overdue} />
          <QueueSection title={t('dashboard.dueSoon')} accent="text-teal-500 dark:text-teal-100" items={dueSoon} />
          <QueueSection title={t('dashboard.onTrack')} accent="text-moss-600" items={onTrack} />
        </div>
      )}
    </div>
  );
}

function QueueSection({ title, accent, items }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className={`font-display text-lg font-semibold ${accent}`}>{title} ({items.length})</h2>
      <div className="mt-3 space-y-3">
        {items.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
      </div>
    </div>
  );
}
