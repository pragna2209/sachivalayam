import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCitizens, setCitizenStatus } from '../../api/staffApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/dateFormat';

export default function UserManagementPage() {
  const { t, i18n } = useTranslation();
  const [citizens, setCitizens] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    listCitizens({ search: debouncedSearch || undefined, page, limit: 15 })
      .then(({ data }) => {
        setCitizens(data.data);
        setMeta(data.meta || { totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [debouncedSearch, page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleStatus(citizen) {
    await setCitizenStatus(citizen._id, !citizen.isActive);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('admin.userManagement')}</h1>

      <input
        className="input-field mt-4 max-w-xs"
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : citizens.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-light/60 text-xs uppercase tracking-wide text-sand dark:border-teal-700">
                  <th className="py-2 pr-4 font-medium">{t('auth.name')}</th>
                  <th className="py-2 pr-4 font-medium">{t('auth.phoneNumber')}</th>
                  <th className="py-2 pr-4 font-medium">{t('common.date')}</th>
                  <th className="py-2 pr-4 font-medium">{t('admin.active')}</th>
                  <th className="py-2 pr-4 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((c) => (
                  <tr key={c._id} className="border-b border-sand-light/40 dark:border-teal-700/40">
                    <td className="py-2 pr-4">{c.name}</td>
                    <td className="py-2 pr-4 font-mono">{c.phoneNumber}</td>
                    <td className="py-2 pr-4">{formatDate(c.createdAt, i18n.language)}</td>
                    <td className="py-2 pr-4">
                      <span className={c.isActive ? 'text-moss-600' : 'text-rust-500'}>
                        {c.isActive ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <button type="button" onClick={() => toggleStatus(c)} className="text-teal-500 hover:underline dark:text-teal-100">
                        {c.isActive ? t('common.delete') : t('common.activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
