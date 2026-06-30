import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ForbiddenPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-mono text-sm text-sand">403</p>
      <h1 className="font-display text-2xl font-semibold">{t('errors.forbidden')}</h1>
      <Link to="/" className="btn-primary mt-2">Back to home</Link>
    </div>
  );
}
