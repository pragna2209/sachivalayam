import { Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import AnonymousComplaintPage from '../pages/public/AnonymousComplaintPage';
import AnonymousTrackingPage from '../pages/public/AnonymousTrackingPage';
import ForbiddenPage from '../pages/public/ForbiddenPage';

/**
 * Called directly (PublicRoutes()), not rendered as <PublicRoutes />.
 * React Router v6's <Routes> inspects its DIRECT <Route> children to
 * build its matching tree - it does not render through arbitrary
 * component layers. Calling this as a plain function and spreading its
 * returned JSX inline inside <Routes> in index.jsx keeps every <Route>
 * a true direct child, while still letting each role's route table live
 * in its own file as the approved folder structure specifies.
 */
export default function PublicRoutes() {
  return (
    <Route key="public" element={<PublicLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/anonymous/report" element={<AnonymousComplaintPage />} />
      <Route path="/anonymous/track" element={<AnonymousTrackingPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
    </Route>
  );
}
