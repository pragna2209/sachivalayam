import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import { timeAgo } from '../../utils/dateFormat';

export default function NotificationBell() {
  const { t } = useTranslation();
  const { items, unreadCount, markRead, markAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('notifications.title')}
        className="relative flex h-9 w-9 items-center justify-center rounded border border-sand-light text-ink transition-colors hover:bg-teal-50 dark:border-teal-600 dark:text-ink-dark dark:hover:bg-teal-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded border border-sand-light bg-white shadow-lg dark:bg-teal-700 dark:border-teal-600">
          <div className="flex items-center justify-between border-b border-sand-light/60 px-4 py-3 dark:border-teal-600">
            <span className="font-display text-sm font-semibold">{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAll} className="text-xs text-teal-500 hover:underline dark:text-teal-100">
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-sand">{t('notifications.empty')}</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n._id}
                  to={n.complaintId ? `/complaints/${n.complaintId}` : '#'}
                  onClick={() => {
                    if (!n.isRead) markRead(n._id);
                    setOpen(false);
                  }}
                  className={`block border-b border-sand-light/40 px-4 py-3 text-sm transition-colors last:border-0 hover:bg-teal-50 dark:border-teal-600/40 dark:hover:bg-teal-600 ${
                    !n.isRead ? 'bg-teal-50/60 dark:bg-teal-600/40' : ''
                  }`}
                >
                  <p className="font-medium">{n.title?.[document.documentElement.lang] || n.title?.en}</p>
                  <p className="mt-0.5 text-sand">{n.body?.[document.documentElement.lang] || n.body?.en}</p>
                  <p className="mt-1 text-xs text-sand">{timeAgo(n.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
