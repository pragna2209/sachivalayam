import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getComplaint,
  updateComplaintStatus,
  reopenComplaint,
  submitComplaintFeedback,
  reassignComplaint,
  escalateComplaint,
  uploadEvidence
} from '../../api/complaintApi';
import { listStaff } from '../../api/staffApi';
import StatusBadge from '../../components/complaint/StatusBadge';
import EscalationBadge from '../../components/complaint/EscalationBadge';
import ComplaintTimeline from '../../components/complaint/ComplaintTimeline';
import EvidenceGallery from '../../components/complaint/EvidenceGallery';
import FileUploadWidget from '../../components/upload/FileUploadWidget';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import { formatDate, formatDateTime } from '../../utils/dateFormat';
import { ROLES, STAFF_LIKE_ROLES, OFFICER_ROLES, VALID_TRANSITIONS, COMPLAINT_STATUS } from '../../utils/constants';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getComplaint(id)
      .then(({ data }) => setComplaint(data.data))
      .catch((err) => setError(err.response?.data?.message || t('errors.notFound')))
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-sm text-rust-500">{error}</p>;
  if (!complaint) return null;

  const categoryName = complaint.categoryId?.name?.[i18n.language] || complaint.categoryId?.name?.en;
  const isCitizenOwner = user.role === ROLES.CITIZEN;
  const isStaffOrOfficer = STAFF_LIKE_ROLES.includes(user.role);
  const isOfficerOrAdmin = OFFICER_ROLES.includes(user.role) || user.role === ROLES.ADMIN;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-sand">{complaint.complaintNumber}</span>
            <StatusBadge status={complaint.status} />
            {complaint.escalations?.length > 0 && <EscalationBadge count={complaint.escalations.length} />}
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold">{complaint.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80 dark:text-ink-dark/80">{complaint.description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded border border-sand-light/60 p-4 text-sm dark:border-teal-700 sm:grid-cols-3">
          <div>
            <dt className="label-eyebrow">{t('common.category')}</dt>
            <dd className="mt-0.5">{categoryName}</dd>
          </div>
          <div>
            <dt className="label-eyebrow">{t('complaint.filedOn')}</dt>
            <dd className="mt-0.5">{formatDate(complaint.createdAt, i18n.language)}</dd>
          </div>
          <div>
            <dt className="label-eyebrow">{t('complaint.assignedTo')}</dt>
            <dd className="mt-0.5">{complaint.assignedTo?.name || '—'}</dd>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <dt className="label-eyebrow">{t('complaint.address')}</dt>
            <dd className="mt-0.5">{complaint.address?.line1}, {complaint.address?.pincode}</dd>
          </div>
        </dl>

        <div>
          <h2 className="font-display text-lg font-semibold">{t('complaint.evidence')}</h2>
          {/*
            NOTE: the backend currently has no GET endpoint that lists
            evidence files for a given complaint (evidence.routes.js only
            exposes upload-by-complaint and fetch-one-by-evidence-id, and
            complaints.service.js#getComplaintById does not populate
            evidence either). EvidenceGallery is wired to render
            complaint.evidenceFiles defensively (renders the empty state
            if absent) so this doesn't crash, but evidence uploaded against
            this complaint will not actually be visible here until a
            GET /complaints/:id/evidence (or equivalent) endpoint is added
            to the backend.
          */}
          <div className="mt-3">
            <EvidenceGallery files={complaint.evidenceFiles || []} />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">{t('complaint.timeline')}</h2>
          <div className="mt-3">
            <ComplaintTimeline timeline={complaint.timeline || []} />
          </div>
        </div>

        {complaint.escalations?.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold">{t('complaint.escalationHistory')}</h2>
            <ul className="mt-3 space-y-2">
              {complaint.escalations.map((esc) => (
                <li key={esc.escalationId} className="card text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-rust-500">{esc.level.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-sand">{formatDateTime(esc.triggeredAt, i18n.language)}</span>
                  </div>
                  <p className="mt-1 text-sand">{esc.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {isStaffOrOfficer && <StaffActionPanel complaint={complaint} onUpdated={load} />}
        {isOfficerOrAdmin && <OfficerActionPanel complaint={complaint} onUpdated={load} />}
        {isCitizenOwner && <CitizenActionPanel complaint={complaint} onUpdated={load} />}
      </div>
    </div>
  );
}

function StaffActionPanel({ complaint, onUpdated }) {
  const { t } = useTranslation();
  const nextStatuses = VALID_TRANSITIONS[complaint.status] || [];
  const [status, setStatus] = useState(nextStatuses[0] || '');
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (nextStatuses.length === 0) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!remark.trim()) {
      setError(t('errors.validation'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const uploadedIds = [];
      for (const file of files) {
        const { data } = await uploadEvidence(complaint._id, file, status);
        uploadedIds.push(data.data._id);
      }
      await updateComplaintStatus(complaint._id, { status, remark, evidenceFileIds: uploadedIds });
      setRemark('');
      setFiles([]);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-display text-base font-semibold">{t('complaint.updateStatus')}</h3>
      <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
        {nextStatuses.map((s) => (
          <option key={s} value={s}>{t(`complaint.statusValues.${s}`)}</option>
        ))}
      </select>
      <textarea
        className="input-field"
        rows={3}
        placeholder={t('complaint.remarkPlaceholder')}
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />
      <FileUploadWidget files={files} onFilesChange={setFiles} maxFiles={3} />
      {error && <p className="text-xs text-rust-500">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? t('common.loading') : t('complaint.updateStatus')}
      </button>
    </form>
  );
}

function OfficerActionPanel({ complaint, onUpdated }) {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [reassignRemark, setReassignRemark] = useState('');
  const [escalateLevel, setEscalateLevel] = useState('MANDAL_LEVEL_1');
  const [escalateReason, setEscalateReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listStaff({ mandalId: complaint.mandalId, limit: 50 }).then(({ data }) => setStaffList(data.data));
  }, [complaint.mandalId]);

  async function handleReassign(e) {
    e.preventDefault();
    if (!assignedTo) return;
    setBusy(true);
    setError('');
    try {
      await reassignComplaint(complaint._id, { assignedTo, remark: reassignRemark || undefined });
      setReassignRemark('');
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setBusy(false);
    }
  }

  async function handleEscalate(e) {
    e.preventDefault();
    if (!escalateReason.trim()) {
      setError(t('errors.validation'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await escalateComplaint(complaint._id, { level: escalateLevel, reason: escalateReason });
      setEscalateReason('');
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={handleReassign} className="card space-y-3">
        <h3 className="font-display text-base font-semibold">{t('complaint.reassign')}</h3>
        <select className="input-field" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">{t('complaint.reassignTo')}</option>
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <input
          className="input-field"
          placeholder={t('complaint.remark')}
          value={reassignRemark}
          onChange={(e) => setReassignRemark(e.target.value)}
        />
        <button type="submit" disabled={busy || !assignedTo} className="btn-secondary w-full">
          {t('complaint.reassign')}
        </button>
      </form>

      <form onSubmit={handleEscalate} className="card space-y-3">
        <h3 className="font-display text-base font-semibold">{t('complaint.escalate')}</h3>
        <select className="input-field" value={escalateLevel} onChange={(e) => setEscalateLevel(e.target.value)}>
          <option value="MANDAL_LEVEL_1">Mandal Officer</option>
          <option value="DISTRICT_LEVEL_2">District Officer</option>
        </select>
        <textarea
          className="input-field"
          rows={2}
          placeholder={t('complaint.escalateReason')}
          value={escalateReason}
          onChange={(e) => setEscalateReason(e.target.value)}
        />
        {error && <p className="text-xs text-rust-500">{error}</p>}
        <button type="submit" disabled={busy} className="btn-danger w-full">
          {t('complaint.escalate')}
        </button>
      </form>
    </>
  );
}

function CitizenActionPanel({ complaint, onUpdated }) {
  const { t } = useTranslation();
  const [reopenRemark, setReopenRemark] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedbackDone, setFeedbackDone] = useState(!!complaint.feedback);

  const canReopen =
    [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED].includes(complaint.status) &&
    complaint.reopenDeadline &&
    new Date(complaint.reopenDeadline) > new Date();

  const canGiveFeedback = [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED].includes(complaint.status) && !feedbackDone;

  async function handleReopen(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await reopenComplaint(complaint._id, { remark: reopenRemark || undefined });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setBusy(false);
    }
  }

  async function handleFeedback(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await submitComplaintFeedback(complaint._id, { rating, comment: comment || undefined });
      setFeedbackDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {canGiveFeedback && (
        <form onSubmit={handleFeedback} className="card space-y-3">
          <h3 className="font-display text-base font-semibold">{t('complaint.giveFeedback')}</h3>
          <div>
            <label className="label-eyebrow">{t('complaint.yourRating')}</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star`}
                  className={`text-2xl ${n <= rating ? 'text-rust-500' : 'text-sand-light'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="input-field"
            rows={2}
            placeholder={t('complaint.feedbackComment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" disabled={busy} className="btn-primary w-full">{t('complaint.submitFeedback')}</button>
        </form>
      )}

      {feedbackDone && <p className="card text-sm text-moss-600">{t('complaint.feedbackThanks')}</p>}

      {canReopen && (
        <form onSubmit={handleReopen} className="card space-y-3">
          <h3 className="font-display text-base font-semibold">{t('complaint.reopenComplaint')}</h3>
          <textarea
            className="input-field"
            rows={2}
            placeholder={t('complaint.reopenReason')}
            value={reopenRemark}
            onChange={(e) => setReopenRemark(e.target.value)}
          />
          {error && <p className="text-xs text-rust-500">{error}</p>}
          <button type="submit" disabled={busy} className="btn-danger w-full">{t('complaint.reopenComplaint')}</button>
        </form>
      )}
    </>
  );
}
