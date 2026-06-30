import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listComplaints } from '../../api/complaintApi';
import { listCategories } from '../../api/categoryApi';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { COMPLAINT_STATUS } from '../../utils/constants';

export default function MyComplaintsPage() {
  const { t, i18n } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories().then(({ data }) => setCategories(data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    listComplaints({ status: status || undefined, categoryId: categoryId || undefined, page, limit: 10 })
      .then(({ data }) => {
        setComplaints(data.data);
        setMeta(data.meta || { totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [status, categoryId, page]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.myComplaints')}</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <select className="input-field max-w-[200px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">{t('common.status')}: {t('common.filters')}</option>
          {Object.values(COMPLAINT_STATUS).map((s) => (
            <option key={s} value={s}>{t(`complaint.statusValues.${s}`)}</option>
          ))}
        </select>
        <select className="input-field max-w-[200px]" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}>
          <option value="">{t('common.category')}: {t('common.filters')}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name?.[i18n.language] || c.name?.en}</option>
          ))}
        </select>
        {(status || categoryId) && (
          <button
            type="button"
            onClick={() => { setStatus(''); setCategoryId(''); setPage(1); }}
            className="text-sm text-teal-500 hover:underline dark:text-teal-100"
          >
            {t('common.clearFilters')}
          </button>
        )}
      </div>

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
