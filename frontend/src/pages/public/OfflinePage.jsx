import { useTranslation } from 'react-i18next';

export default function OfflinePage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sand">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
      <h1 className="font-display text-2xl font-semibold">{t('errors.network')}</h1>
      <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-2">
        {t('common.retry')}
      </button>
    </div>
  );
}
