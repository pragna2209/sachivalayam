export default function EscalationBadge({ count }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-rust-50 px-1.5 py-0.5 text-[11px] font-medium text-rust-600">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L1 21h22L12 2zm0 5.5L18.5 19h-13L12 7.5zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z" />
      </svg>
      {count > 1 ? `Escalated ×${count}` : 'Escalated'}
    </span>
  );
}
