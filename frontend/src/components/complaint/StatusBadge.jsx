import { useTranslation } from 'react-i18next';
import { STATUS_COLOR } from '../../utils/constants';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const colorClass = STATUS_COLOR[status] || 'bg-sand-light text-ink';

  return (
    <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      {t(`complaint.statusValues.${status}`, status)}
    </span>
  );
}
