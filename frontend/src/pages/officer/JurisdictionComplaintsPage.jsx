import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { COMPLAINT_STATUS } from '../../utils/constants';

export default function JurisdictionComplaintsPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listComplaints({ status: status || undefined, page, limit: 10 })
      .then(({ data }) => {
        setComplaints(data.data);
        setMeta(data.meta || { totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.complaints')}</h1>

      <select className="input-field mt-4 max-w-[220px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <option value="">{t('common.status')}: {t('common.filters')}</option>
        {Object.values(COMPLAINT_STATUS).map((s) => (
          <option key={s} value={s}>{t(`complaint.statusValues.${s}`)}</option>
        ))}
      </select>

      <div className="mt-6 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : complaints.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)
        )}
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
