import { Navigate, useParams } from 'react-router-dom';

/**
 * Reopen is implemented as an inline action panel on ComplaintDetailPage
 * (CitizenActionPanel) rather than a separate full-page flow, since it's
 * a single textarea + button triggered from the complaint a citizen is
 * already looking at. This route exists so the approved folder structure
 * (a dedicated ReopenComplaintPage) has a real entry point and any direct
 * link to /citizen/complaints/:id/reopen still lands somewhere useful.
 */
export default function ReopenComplaintPage() {
  const { id } = useParams();
  return <Navigate to={`/complaints/${id}`} replace />;
}
