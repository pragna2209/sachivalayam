export default function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-sand-light px-6 py-12 text-center dark:border-teal-600">
      <p className="font-display text-base font-medium text-ink dark:text-ink-dark">{title}</p>
      {body && <p className="max-w-sm text-sm text-sand">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
