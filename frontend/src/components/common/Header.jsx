import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import useAuth from '../../hooks/useAuth';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-sand-light/60 bg-paper/95 px-4 backdrop-blur dark:border-teal-700 dark:bg-paper-dark/95 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded text-ink hover:bg-teal-50 dark:text-ink-dark dark:hover:bg-teal-700 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        )}
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher compact />
        <ThemeToggle />
        {user && <NotificationBell />}
        {user && (
          <Link
            to="/profile"
            className="hidden h-9 items-center gap-2 rounded border border-sand-light px-3 text-sm text-ink hover:bg-teal-50 dark:border-teal-600 dark:text-ink-dark dark:hover:bg-teal-700 sm:flex"
          >
            {user.name}
          </Link>
        )}
      </div>
    </header>
  );
}
