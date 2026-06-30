import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listDepartments, createDepartment } from '../../api/categoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { minLength } from '../../utils/validators';

export default function DepartmentManagementPage() {
  const { t, i18n } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    listDepartments().then(({ data }) => setDepartments(data.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t('admin.departmentManagement')}</h1>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {t('admin.createDepartment')}
        </button>
      </div>

      {showForm && (
        <div className="mt-6">
          <CreateDepartmentForm onCreated={() => { setShowForm(false); load(); }} />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : departments.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <div key={d._id} className="card">
                <p className="font-medium">{d.name?.[i18n.language] || d.name?.en}</p>
                <p className="mt-1 text-xs text-sand">{d.description?.[i18n.language] || d.description?.en}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateDepartmentForm({ onCreated }) {
  const { t } = useTranslation();
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [descEn, setDescEn] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!minLength(nameEn, 1) || !minLength(nameTe, 1) || !minLength(nameHi, 1)) return setError(t('errors.validation'));

    setSubmitting(true);
    try {
      await createDepartment({
        name: { en: nameEn, te: nameTe, hi: nameHi },
        description: { en: descEn || nameEn, te: nameTe, hi: nameHi }
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-eyebrow">Name (English)</label>
          <input className="input-field mt-1" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
        <div>
          <label className="label-eyebrow">Name (Telugu)</label>
          <input className="input-field mt-1" value={nameTe} onChange={(e) => setNameTe(e.target.value)} />
        </div>
        <div>
          <label className="label-eyebrow">Name (Hindi)</label>
          <input className="input-field mt-1" value={nameHi} onChange={(e) => setNameHi(e.target.value)} />
        </div>
        <div>
          <label className="label-eyebrow">Description (English)</label>
          <input className="input-field mt-1" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-rust-500">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t('common.loading') : t('admin.createDepartment')}
      </button>
    </form>
  );
}
