import { Route } from 'react-router-dom';
import RoleGuard from '../components/auth/RoleGuard';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagementPage from '../pages/admin/UserManagementPage';
import StaffManagementPage from '../pages/admin/StaffManagementPage';
import ComplaintManagementPage from '../pages/admin/ComplaintManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import DepartmentManagementPage from '../pages/admin/DepartmentManagementPage';
import GeoHierarchyManagementPage from '../pages/admin/GeoHierarchyManagementPage';
import AnalyticsDashboardPage from '../pages/admin/AnalyticsDashboardPage';
import ReportsPage from '../pages/admin/ReportsPage';
import AuditLogPage from '../pages/admin/AuditLogPage';
import ActivityLogPage from '../pages/admin/ActivityLogPage';
import SettingsPage from '../pages/admin/SettingsPage';
import { ROLES } from '../utils/constants';

export default function AdminRoutes() {
  return (
    <Route key="admin" element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/staff" element={<StaffManagementPage />} />
        <Route path="/admin/complaints" element={<ComplaintManagementPage />} />
        <Route path="/admin/categories" element={<CategoryManagementPage />} />
        <Route path="/admin/departments" element={<DepartmentManagementPage />} />
        <Route path="/admin/geography" element={<GeoHierarchyManagementPage />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/audit-log" element={<AuditLogPage />} />
        <Route path="/admin/activity-log" element={<ActivityLogPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>
    </Route>
  );
}
