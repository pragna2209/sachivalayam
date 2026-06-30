import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import EscalationBadge from './EscalationBadge';
import { formatDate } from '../../utils/dateFormat';

export default function ComplaintCard({ complaint }) {
  const { t, i18n } = useTranslation();
  const categoryName = complaint.categoryId?.name?.[i18n.language] || complaint.categoryId?.name?.en || '';

  return (
    <Link
      to={`/complaints/${complaint._id}`}
      className="card flex flex-col gap-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-sand">{complaint.complaintNumber}</span>
          {complaint.escalations?.length > 0 && <EscalationBadge count={complaint.escalations.length} />}
        </div>
        <p className="mt-1 truncate font-display text-base font-medium">{complaint.title}</p>
        <p className="mt-0.5 text-xs text-sand">
          {categoryName} · {formatDate(complaint.createdAt, i18n.language)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={complaint.status} />
        <span className="text-sm text-teal-500 dark:text-teal-100">{t('common.viewDetails')} →</span>
      </div>
    </Link>
  );
}
