import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'sachivalayam_access_token';
const REFRESH_TOKEN_KEY = 'sachivalayam_refresh_token';
const USER_KEY = 'sachivalayam_user';

function loadUserFromStorage() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const useAuthStore = create((set, get) => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  user: loadUserFromStorage(),

  isAuthenticated: () => !!get().accessToken && !!get().user,

  setSession: ({ accessToken, refreshToken, user }) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({
      accessToken: accessToken || get().accessToken,
      refreshToken: refreshToken || get().refreshToken,
      user: user || get().user
    });
  },

  setAccessToken: (accessToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    set({ accessToken });
  },

  updateUser: (partialUser) => {
    const merged = { ...get().user, ...partialUser };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    set({ user: merged });
  },

  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  }
}));

export default useAuthStore;
