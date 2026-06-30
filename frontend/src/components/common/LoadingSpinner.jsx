export default function LoadingSpinner({ size = 24, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-sand">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin text-teal-500"
        role="status"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
