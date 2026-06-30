import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';

const NAV_BY_ROLE = {
  [ROLES.CITIZEN]: [
    { to: '/citizen/dashboard', key: 'dashboard' },
    { to: '/citizen/complaints/new', key: 'raiseComplaint' },
    { to: '/citizen/complaints', key: 'myComplaints' },
    { to: '/notifications', key: 'notifications' },
    { to: '/profile', key: 'profile' }
  ],
  [ROLES.SACHIVALAYAM_STAFF]: [
    { to: '/staff/dashboard', key: 'dashboard' },
    { to: '/notifications', key: 'notifications' },
    { to: '/profile', key: 'profile' }
  ],
  [ROLES.MANDAL_OFFICER]: [
    { to: '/officer/dashboard', key: 'dashboard' },
    { to: '/officer/complaints', key: 'complaints' },
    { to: '/officer/staff-performance', key: 'staffPerformance' },
    { to: '/officer/analytics', key: 'analytics' },
    { to: '/officer/escalations', key: 'escalations' },
    { to: '/notifications', key: 'notifications' },
    { to: '/profile', key: 'profile' }
  ],
  [ROLES.DISTRICT_OFFICER]: [
    { to: '/officer/dashboard', key: 'dashboard' },
    { to: '/officer/complaints', key: 'complaints' },
    { to: '/officer/staff-performance', key: 'staffPerformance' },
    { to: '/officer/analytics', key: 'analytics' },
    { to: '/officer/escalations', key: 'escalations' },
    { to: '/notifications', key: 'notifications' },
    { to: '/profile', key: 'profile' }
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', key: 'dashboard' },
    { to: '/admin/complaints', key: 'complaints' },
    { to: '/admin/users', key: 'users' },
    { to: '/admin/staff', key: 'staff' },
    { to: '/admin/categories', key: 'categories' },
    { to: '/admin/departments', key: 'departments' },
    { to: '/admin/geography', key: 'geography' },
    { to: '/admin/analytics', key: 'analytics' },
    { to: '/admin/reports', key: 'reports' },
    { to: '/admin/audit-log', key: 'auditLog' },
    { to: '/admin/activity-log', key: 'activityLog' },
    { to: '/admin/settings', key: 'settings' },
    { to: '/notifications', key: 'notifications' },
    { to: '/profile', key: 'profile' }
  ]
};

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sand-light/60 bg-paper transition-transform dark:border-teal-700 dark:bg-paper-dark lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 lg:hidden">
          <span className="font-display text-lg font-semibold text-teal-500 dark:text-teal-100">
            {t('common.appName')}
          </span>
        </div>
        <nav className="status-thread flex flex-col gap-1 px-6 py-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `relative rounded px-3 py-2 text-sm transition-colors before:absolute before:-left-[19px] before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full ${
                  isActive
                    ? 'bg-teal-50 font-medium text-teal-500 before:bg-rust-500 dark:bg-teal-700 dark:text-teal-100'
                    : 'text-ink before:bg-transparent hover:bg-teal-50 dark:text-ink-dark dark:hover:bg-teal-700'
                }`
              }
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 w-full border-t border-sand-light/60 px-6 py-4 dark:border-teal-700">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-rust-500 hover:bg-rust-50 dark:hover:bg-teal-700"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
