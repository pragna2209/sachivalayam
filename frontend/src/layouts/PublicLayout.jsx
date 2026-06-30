import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import ThemeToggle from '../components/common/ThemeToggle';
import Logo from '../components/common/Logo';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-sand-light/60 px-4 dark:border-teal-700 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
