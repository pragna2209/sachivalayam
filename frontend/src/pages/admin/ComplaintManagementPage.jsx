import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import useDebounce from '../../hooks/useDebounce';
import { COMPLAINT_STATUS } from '../../utils/constants';

export default function ComplaintManagementPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
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

  const filtered = debouncedSearch
    ? complaints.filter(
        (c) =>
          c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.complaintNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : complaints;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.complaints')}</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          className="input-field max-w-xs"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field max-w-[220px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">{t('common.status')}: {t('common.filters')}</option>
          {Object.values(COMPLAINT_STATUS).map((s) => (
            <option key={s} value={s}>{t(`complaint.statusValues.${s}`)}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          filtered.map((c) => <ComplaintCard key={c._id} complaint={c} />)
        )}
      </div>

      {!debouncedSearch && (
        <div className="mt-6">
          <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
