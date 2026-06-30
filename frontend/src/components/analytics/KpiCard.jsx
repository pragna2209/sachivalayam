export default function KpiCard({ label, value, accent = 'teal' }) {
  const accentClass = {
    teal: 'text-teal-500 dark:text-teal-100',
    rust: 'text-rust-500',
    moss: 'text-moss-500'
  }[accent];

  return (
    <div className="card">
      <p className="label-eyebrow">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
