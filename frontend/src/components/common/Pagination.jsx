import { useTranslation } from 'react-i18next';

export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-sand-light/60 pt-4 dark:border-teal-700">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        {t('common.back')}
      </button>
      <span className="text-xs text-sand">
        {t('common.page')} {page} {t('common.of')} {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        {t('common.next')}
      </button>
    </div>
  );
}
