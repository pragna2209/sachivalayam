import { useTranslation } from 'react-i18next';

export default function StaffLeaderboard({ data }) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return <p className="py-8 text-center text-sm text-sand">{t('common.noResults')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-sand-light/60 text-xs uppercase tracking-wide text-sand dark:border-teal-700">
            <th className="py-2 pr-4 font-medium">Staff</th>
            <th className="py-2 pr-4 font-medium">{t('analytics.totalAssigned')}</th>
            <th className="py-2 pr-4 font-medium">{t('analytics.totalResolved')}</th>
            <th className="py-2 pr-4 font-medium">{t('analytics.avgResolutionDays')}</th>
            <th className="py-2 pr-4 font-medium">{t('analytics.avgRating')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.staffId} className="border-b border-sand-light/40 dark:border-teal-700/40">
              <td className="py-2 pr-4">
                <div>{row.staffName}</div>
                <div className="text-xs text-sand">{t(`roles.${row.staffRole}`, row.staffRole)}</div>
              </td>
              <td className="py-2 pr-4">{row.totalAssigned}</td>
              <td className="py-2 pr-4">{row.totalResolved}</td>
              <td className="py-2 pr-4">{row.avgResolutionDays ? row.avgResolutionDays.toFixed(1) : '—'}</td>
              <td className="py-2 pr-4">{row.avgRating ? row.avgRating.toFixed(1) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
