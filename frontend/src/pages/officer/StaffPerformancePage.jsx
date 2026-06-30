import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStaffPerformance } from '../../api/analyticsApi';
import StaffLeaderboard from '../../components/analytics/StaffLeaderboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StaffPerformancePage() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaffPerformance({})
      .then(({ data: res }) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('nav.staffPerformance')}</h1>
      <div className="mt-6 card">
        {loading ? <LoadingSpinner /> : <StaffLeaderboard data={data} />}
      </div>
    </div>
  );
}
