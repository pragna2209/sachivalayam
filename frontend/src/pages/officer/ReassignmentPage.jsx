import { Navigate, useParams } from 'react-router-dom';

/**
 * Reassignment is implemented inline on ComplaintDetailPage
 * (OfficerActionPanel), where the officer can see the complaint's full
 * context before choosing a new assignee. See ComplaintActionPage.jsx for
 * the same rationale applied to staff status updates.
 */
export default function ReassignmentPage() {
  const { id } = useParams();
  return <Navigate to={`/complaints/${id}`} replace />;
}
