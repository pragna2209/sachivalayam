import { Route } from 'react-router-dom';
import RoleGuard from '../components/auth/RoleGuard';
import CitizenLayout from '../layouts/CitizenLayout';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import RaiseComplaintPage from '../pages/citizen/RaiseComplaintPage';
import MyComplaintsPage from '../pages/citizen/MyComplaintsPage';
import ComplaintDetailPage from '../pages/citizen/ComplaintDetailPage';
import ReopenComplaintPage from '../pages/citizen/ReopenComplaintPage';
import FeedbackPage from '../pages/citizen/FeedbackPage';
import { ROLES } from '../utils/constants';

export default function CitizenRoutes() {
  return (
    <Route key="citizen" element={<RoleGuard allowedRoles={[ROLES.CITIZEN]} />}>
      <Route element={<CitizenLayout />}>
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/complaints/new" element={<RaiseComplaintPage />} />
        <Route path="/citizen/complaints" element={<MyComplaintsPage />} />
        <Route path="/citizen/complaints/:id/reopen" element={<ReopenComplaintPage />} />
        <Route path="/citizen/complaints/:id/feedback" element={<FeedbackPage />} />
      </Route>
    </Route>
  );
}
