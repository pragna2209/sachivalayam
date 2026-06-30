import { useCallback, useEffect } from 'react';
import useNotificationStore from '../store/notificationStore';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi';
import useAuth from './useAuth';

const POLL_INTERVAL_MS = 60000;

export default function useNotifications() {
  const { isAuthenticated } = useAuth();
  const { items, unreadCount, setNotifications, markOneRead, markAllRead } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await listNotifications({ limit: 20 });
      setNotifications(data.data, data.meta ? data.meta.unreadCount : 0);
    } catch {
      // Silent failure on poll - the bell just won't update this cycle.
    }
  }, [isAuthenticated, setNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    markOneRead(id);
    try {
      await markNotificationRead(id);
    } catch {
      // Best-effort; next poll will reconcile state if this failed.
    }
  }, [markOneRead]);

  const markAll = useCallback(async () => {
    markAllRead();
    try {
      await markAllNotificationsRead();
    } catch {
      // Best-effort; next poll will reconcile state if this failed.
    }
  }, [markAllRead]);

  return { items, unreadCount, refetch: fetchNotifications, markRead, markAll };
}
