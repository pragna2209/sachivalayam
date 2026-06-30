import { Route } from 'react-router-dom';
import RoleGuard from '../components/auth/RoleGuard';
import OfficerLayout from '../layouts/OfficerLayout';
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import JurisdictionComplaintsPage from '../pages/officer/JurisdictionComplaintsPage';
import ReassignmentPage from '../pages/officer/ReassignmentPage';
import StaffPerformancePage from '../pages/officer/StaffPerformancePage';
import JurisdictionAnalyticsPage from '../pages/officer/JurisdictionAnalyticsPage';
import EscalationQueuePage from '../pages/officer/EscalationQueuePage';
import { OFFICER_ROLES } from '../utils/constants';

export default function OfficerRoutes() {
  return (
    <Route key="officer" element={<RoleGuard allowedRoles={OFFICER_ROLES} />}>
      <Route element={<OfficerLayout />}>
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/complaints" element={<JurisdictionComplaintsPage />} />
        <Route path="/officer/complaints/:id/reassign" element={<ReassignmentPage />} />
        <Route path="/officer/staff-performance" element={<StaffPerformancePage />} />
        <Route path="/officer/analytics" element={<JurisdictionAnalyticsPage />} />
        <Route path="/officer/escalations" element={<EscalationQueuePage />} />
      </Route>
    </Route>
  );
}
