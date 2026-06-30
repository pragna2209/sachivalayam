import { Routes, Route } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import CitizenRoutes from './CitizenRoutes';
import StaffRoutes from './StaffRoutes';
import OfficerRoutes from './OfficerRoutes';
import AdminRoutes from './AdminRoutes';
import RoleGuard from '../components/auth/RoleGuard';
import CitizenLayout from '../layouts/CitizenLayout';
import ComplaintDetailPage from '../pages/citizen/ComplaintDetailPage';
import NotificationsPage from '../pages/citizen/NotificationsPage';
import ProfilePage from '../pages/citizen/ProfilePage';
import NotFoundPage from '../pages/public/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}
      {CitizenRoutes()}
      {StaffRoutes()}
      {OfficerRoutes()}
      {AdminRoutes()}

      {/*
        Shared authenticated routes reachable by ANY logged-in role -
        complaint detail (the backend's GET /complaints/:id already
        scopes visibility by jurisdiction, so the same route safely serves
        citizen/staff/officer/admin and renders different action panels
        per role - see ComplaintDetailPage.jsx), plus notifications and
        profile which are identical UI for every role.
      */}
      <Route element={<RoleGuard />}>
        <Route element={<CitizenLayout />}>
          <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
