import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCategories, createCategory } from '../../api/categoryApi';
import { listDepartments } from '../../api/categoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { minLength } from '../../utils/validators';
import { CATEGORY_CODES } from '../../utils/constants';

export default function CategoryManagementPage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([listCategories({ isActive: undefined }), listDepartments()])
      .then(([catRes, deptRes]) => {
        setCategories(catRes.data.data);
        setDepartments(deptRes.data.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t('admin.categoryManagement')}</h1>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {t('admin.createCategory')}
        </button>
      </div>

      {showForm && (
        <div className="mt-6">
          <CreateCategoryForm departments={departments} onCreated={() => { setShowForm(false); load(); }} />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c._id} className="card">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.name?.[i18n.language] || c.name?.en}</p>
                  {c.isSensitive && <span className="rounded bg-rust-50 px-1.5 py-0.5 text-[11px] text-rust-600">Sensitive</span>}
                </div>
                <p className="mt-1 text-xs font-mono text-sand">{c.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateCategoryForm({ departments, onCreated }) {
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [defaultDepartmentId, setDefaultDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!code) return setError(t('errors.validation'));
    if (!minLength(nameEn, 1) || !minLength(nameTe, 1) || !minLength(nameHi, 1)) return setError(t('errors.validation'));
    if (!defaultDepartmentId) return setError(t('errors.validation'));

    setSubmitting(true);
    try {
      await createCategory({
        code,
        name: { en: nameEn, te: nameTe, hi: nameHi },
        isSensitive,
        defaultDepartmentId
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
          <label className="label-eyebrow">Code</label>
          <select className="input-field mt-1" value={code} onChange={(e) => setCode(e.target.value)}>
            <option value="">Select code</option>
            {CATEGORY_CODES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-eyebrow">{t('common.department')}</label>
          <select className="input-field mt-1" value={defaultDepartmentId} onChange={(e) => setDefaultDepartmentId(e.target.value)}>
            <option value="">{t('common.department')}</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name?.[i18n.language] || d.name?.en}</option>
            ))}
          </select>
        </div>
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
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} />
        Eligible for anonymous reporting
      </label>
      {error && <p className="text-sm text-rust-500">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t('common.loading') : t('admin.createCategory')}
      </button>
    </form>
  );
}
