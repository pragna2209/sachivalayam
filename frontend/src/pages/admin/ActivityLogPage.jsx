import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listActivityLogs } from '../../api/auditApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/dateFormat';

export default function ActivityLogPage() {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listActivityLogs({ page, limit: 20 })
      .then(({ data }) => {
        setLogs(data.data);
        setMeta(data.meta || { totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('admin.activityLogTitle')}</h1>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : logs.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-light/60 text-xs uppercase tracking-wide text-sand dark:border-teal-700">
                  <th className="py-2 pr-4 font-medium">{t('admin.timestamp')}</th>
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">{t('admin.action')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-sand-light/40 dark:border-teal-700/40">
                    <td className="py-2 pr-4 text-xs">{formatDateTime(log.createdAt, i18n.language)}</td>
                    <td className="py-2 pr-4">{log.userId?.name || '—'}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{log.action}</td>
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
