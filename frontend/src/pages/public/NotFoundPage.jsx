import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-mono text-sm text-sand">404</p>
      <h1 className="font-display text-2xl font-semibold">We couldn't find that page.</h1>
      <Link to="/" className="btn-primary mt-2">Back to home</Link>
    </div>
  );
}
