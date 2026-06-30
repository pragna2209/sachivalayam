import { Route } from 'react-router-dom';
import RoleGuard from '../components/auth/RoleGuard';
import StaffLayout from '../layouts/StaffLayout';
import StaffDashboard from '../pages/staff/StaffDashboard';
import ComplaintActionPage from '../pages/staff/ComplaintActionPage';
import MyPerformancePage from '../pages/staff/MyPerformancePage';
import { ROLES } from '../utils/constants';

export default function StaffRoutes() {
  return (
    <Route key="staff" element={<RoleGuard allowedRoles={[ROLES.SACHIVALAYAM_STAFF]} />}>
      <Route element={<StaffLayout />}>
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/complaints/:id/action" element={<ComplaintActionPage />} />
        <Route path="/staff/performance" element={<MyPerformancePage />} />
      </Route>
    </Route>
  );
}
