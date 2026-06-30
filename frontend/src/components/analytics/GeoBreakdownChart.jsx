import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function GeoBreakdownChart({ data }) {
  const { i18n } = useTranslation();

  const chartData = (data || []).map((row) => ({
    name: row.geoName?.[i18n.language] || row.geoName?.en || 'Unknown',
    total: row.totalCount,
    open: row.openCount,
    closed: row.closedCount
  }));

  if (chartData.length === 0) {
    return <p className="py-8 text-center text-sm text-sand">No data for the selected filters.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E9E2C7" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="total" fill="#2E7D32" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
