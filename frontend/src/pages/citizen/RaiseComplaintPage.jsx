import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComplaintForm from '../../components/complaint/ComplaintForm';
import { createComplaint, uploadEvidence } from '../../api/complaintApi';

export default function RaiseComplaintPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit({ payload, files }) {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await createComplaint(payload);
      const complaint = data.data;

      for (const file of files) {
        try {
          await uploadEvidence(complaint._id, file, 'REGISTERED');
        } catch {
          // A single evidence file failing to upload should not roll back
          // the already-successfully-created complaint - the citizen still
          // gets their complaint number and can retry the attachment from
          // the complaint detail page if needed.
        }
      }

      navigate(`/complaints/${complaint._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">{t('nav.raiseComplaint')}</h1>
      {error && <p className="mt-4 text-sm text-rust-500">{error}</p>}
      <div className="mt-6">
        <ComplaintForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
