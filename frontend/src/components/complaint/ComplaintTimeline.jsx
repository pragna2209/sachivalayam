import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../utils/dateFormat';

export default function ComplaintTimeline({ timeline }) {
  const { t, i18n } = useTranslation();

  const sorted = [...timeline].sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));
  const lastIndex = sorted.length - 1;

  return (
    <div className="status-thread">
      {sorted.map((event, index) => (
        <div key={event.eventId || index} className="relative pb-6 last:pb-0">
          <span className={`status-node ${index < lastIndex ? 'is-complete' : 'is-current'}`} aria-hidden="true" />
          <div className="pl-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-medium">{t(`complaint.statusValues.${event.status}`, event.status)}</p>
              <span className="text-xs text-sand">{formatDateTime(event.occurredAt, i18n.language)}</span>
            </div>
            {event.remark && <p className="mt-1 text-sm text-ink/80 dark:text-ink-dark/80">{event.remark}</p>}
            {event.actorRole && (
              <p className="mt-1 text-xs text-sand">
                {t(`roles.${event.actorRole}`, event.actorRole)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
