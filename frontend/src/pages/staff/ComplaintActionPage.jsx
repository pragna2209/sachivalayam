import { Navigate, useParams } from 'react-router-dom';

/**
 * Status updates are implemented as an inline action panel on
 * ComplaintDetailPage (StaffActionPanel) so staff see the full complaint
 * context (description, evidence, prior timeline) while updating it,
 * rather than a bare action form with no context. This route exists for
 * folder-structure completeness and direct-link compatibility.
 */
export default function ComplaintActionPage() {
  const { id } = useParams();
  return <Navigate to={`/complaints/${id}`} replace />;
}
