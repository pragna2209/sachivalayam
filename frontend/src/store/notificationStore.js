import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  items: [],
  unreadCount: 0,
  setNotifications: (items, unreadCount) => set({ items, unreadCount: unreadCount ?? 0 }),
  markOneRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1)
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0
    }))
}));

export default useNotificationStore;
