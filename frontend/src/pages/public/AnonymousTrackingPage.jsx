import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trackAnonymousComplaint } from '../../api/anonymousApi';
import StatusBadge from '../../components/complaint/StatusBadge';
import ComplaintTimeline from '../../components/complaint/ComplaintTimeline';
import { formatDate } from '../../utils/dateFormat';

export default function AnonymousTrackingPage() {
  const { t, i18n } = useTranslation();
  const [trackingId, setTrackingId] = useState('');
  const [pin, setPin] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await trackAnonymousComplaint({ trackingId, pin });
      setComplaint(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('anonymous.invalidCredentials'));
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">{t('anonymous.trackTitle')}</h1>

      <form onSubmit={handleTrack} className="mt-6 card space-y-4">
        <div>
          <label className="label-eyebrow" htmlFor="track-id">{t('anonymous.trackingIdLabel')}</label>
          <input
            id="track-id"
            className="input-field mt-1 font-mono"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.trim())}
          />
        </div>
        <div>
          <label className="label-eyebrow" htmlFor="track-pin">{t('anonymous.pinLabel')}</label>
          <input
            id="track-pin"
            className="input-field mt-1 font-mono"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
        </div>
        {error && <p className="text-sm text-rust-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t('common.loading') : t('anonymous.trackButton')}
        </button>
      </form>

      {complaint && (
        <div className="mt-8 card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-sand">{complaint.complaintNumber}</span>
            <StatusBadge status={complaint.status} />
          </div>
          <h2 className="mt-2 font-display text-lg font-semibold">{complaint.title}</h2>
          <p className="mt-1 text-sm text-sand">{t('complaint.filedOn')}: {formatDate(complaint.createdAt, i18n.language)}</p>

          <h3 className="mt-6 font-display text-base font-semibold">{t('complaint.timeline')}</h3>
          <div className="mt-3">
            <ComplaintTimeline timeline={complaint.timeline || []} />
          </div>
        </div>
      )}
    </div>
  );
}
