import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function EscalationQueuePage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listComplaints({ limit: 100 })
      .then(({ data }) => setComplaints(data.data.filter((c) => c.escalations?.length > 0)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.escalations')}</h1>

      <div className="mt-6 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : complaints.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)
        )}
      </div>
    </div>
  );
}
