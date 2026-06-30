import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logout as logoutApi } from '../api/authApi';

export default function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, setSession, updateUser, clearSession } = useAuthStore();

  const isAuthenticated = !!accessToken && !!user;

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Stateless JWT logout - even if the network call fails, clear the
      // local session so the user is signed out client-side regardless.
    }
    clearSession();
    navigate('/login');
  }, [clearSession, navigate]);

  return { user, isAuthenticated, setSession, updateUser, logout };
}
