import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/dateFormat';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { items, unreadCount, markRead, markAll } = useNotifications();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t('notifications.title')}</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAll} className="text-sm text-teal-500 hover:underline dark:text-teal-100">
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {items.length === 0 ? (
          <EmptyState title={t('notifications.empty')} />
        ) : (
          items.map((n) => (
            <Link
              key={n._id}
              to={n.complaintId ? `/complaints/${n.complaintId}` : '#'}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`card flex items-start justify-between gap-4 transition-shadow hover:shadow-md ${
                !n.isRead ? 'border-teal-300' : ''
              }`}
            >
              <div>
                <p className="font-medium">{n.title?.[document.documentElement.lang] || n.title?.en}</p>
                <p className="mt-1 text-sm text-sand">{n.body?.[document.documentElement.lang] || n.body?.en}</p>
              </div>
              <span className="shrink-0 text-xs text-sand">{timeAgo(n.createdAt)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
