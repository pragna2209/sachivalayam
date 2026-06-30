import { Navigate, useParams } from 'react-router-dom';

/**
 * Feedback, like Reopen, is implemented inline on ComplaintDetailPage
 * (CitizenActionPanel) so the citizen rates a complaint in the same place
 * they're reviewing its timeline. See ReopenComplaintPage.jsx for the
 * identical rationale.
 */
export default function FeedbackPage() {
  const { id } = useParams();
  return <Navigate to={`/complaints/${id}`} replace />;
}
