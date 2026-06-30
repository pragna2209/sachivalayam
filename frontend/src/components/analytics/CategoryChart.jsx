import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function CategoryChart({ data }) {
  const { i18n } = useTranslation();

  const chartData = (data || []).map((row) => ({
    name: row.categoryName?.[i18n.language] || row.categoryName?.en || 'Unknown',
    total: row.totalCount,
    open: row.openCount,
    closed: row.closedCount
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-sand">No data for the selected filters.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 36)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E9E2C7" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="open" stackId="a" fill="#F9A825" name="Open" radius={[0, 0, 0, 0]} />
        <Bar dataKey="closed" stackId="a" fill="#1F8A4C" name="Closed" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
