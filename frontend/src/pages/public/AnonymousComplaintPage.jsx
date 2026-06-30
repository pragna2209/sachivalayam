import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ComplaintForm from '../../components/complaint/ComplaintForm';
import { createAnonymousComplaint } from '../../api/anonymousApi';
import { uploadEvidence } from '../../api/complaintApi';
import { isValidPin6 } from '../../utils/validators';

export default function AnonymousComplaintPage() {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit({ payload, files }) {
    setPinError('');
    setError('');

    if (!isValidPin6(pin)) {
      setPinError(t('errors.validation'));
      return;
    }
    if (pin !== confirmPin) {
      setPinError(t('errors.validation'));
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await createAnonymousComplaint({ ...payload, pin });
      const created = data.data;

      // Evidence is a separate endpoint from complaint creation. The
      // anonymous-complaint route doesn't return an internal complaint id
      // (only the public-safe trackingId/complaintNumber), so the
      // nested /complaints/:id/evidence upload isn't reachable from this
      // unauthenticated flow today. Files captured here are intentionally
      // not silently dropped without telling the person submitting.
      if (files.length > 0) {
        setError(t('anonymous.successBody') + ' (Note: evidence files could not be attached automatically for anonymous reports in this version — please keep them in case staff request them.)');
      }

      setResult(created);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="card">
          <h1 className="font-display text-xl font-semibold text-moss-600">{t('anonymous.successTitle')}</h1>
          <p className="mt-2 text-sm text-sand">{t('anonymous.successBody')}</p>
          <p className="mt-6 rounded bg-teal-50 px-4 py-3 font-mono text-lg font-semibold text-teal-500 dark:bg-teal-700 dark:text-teal-100">
            {result.trackingId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-rust-500">{t('anonymous.title')}</h1>
      <p className="mt-2 text-sm text-sand">{t('anonymous.subtitle')}</p>

      <div className="mt-8 card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-eyebrow" htmlFor="anon-pin">{t('anonymous.pin')}</label>
            <input
              id="anon-pin"
              className="input-field mt-1 font-mono"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="anon-pin-confirm">{t('anonymous.confirmPin')}</label>
            <input
              id="anon-pin-confirm"
              className="input-field mt-1 font-mono"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>
        </div>
        <p className="text-xs text-sand">{t('anonymous.pinHelp')}</p>
        {pinError && <p className="text-xs text-rust-500">{pinError}</p>}
      </div>

      <div className="mt-8">
        <ComplaintForm sensitiveOnly onSubmit={handleSubmit} submitting={submitting} submitLabel={t('anonymous.submitAnonymous')} />
      </div>

      {error && <p className="mt-4 text-sm text-rust-500">{error}</p>}
    </div>
  );
}
