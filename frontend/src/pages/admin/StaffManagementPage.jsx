import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listStaff, createStaff, setStaffStatus } from '../../api/staffApi';
import { listDepartments } from '../../api/categoryApi';
import useGeoHierarchy from '../../hooks/useGeoHierarchy';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { isValidPhoneNumber, isValidEmail, minLength } from '../../utils/validators';
import { ROLES, STAFF_LIKE_ROLES } from '../../utils/constants';

const CREATABLE_ROLES = [...STAFF_LIKE_ROLES, ROLES.ADMIN];

export default function StaffManagementPage() {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    listStaff({ limit: 100 })
      .then(({ data }) => setStaffList(data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(member) {
    await setStaffStatus(member._id, !member.isActive);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t('admin.staffManagement')}</h1>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {t('admin.createStaff')}
        </button>
      </div>

      {showForm && (
        <div className="mt-6">
          <CreateStaffForm
            onCreated={() => {
              setShowForm(false);
              load();
            }}
          />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : staffList.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-light/60 text-xs uppercase tracking-wide text-sand dark:border-teal-700">
                  <th className="py-2 pr-4 font-medium">{t('auth.name')}</th>
                  <th className="py-2 pr-4 font-medium">{t('admin.role')}</th>
                  <th className="py-2 pr-4 font-medium">{t('auth.phoneNumber')}</th>
                  <th className="py-2 pr-4 font-medium">{t('admin.active')}</th>
                  <th className="py-2 pr-4 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s._id} className="border-b border-sand-light/40 dark:border-teal-700/40">
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{t(`roles.${s.role}`, s.role)}</td>
                    <td className="py-2 pr-4 font-mono">{s.phoneNumber}</td>
                    <td className="py-2 pr-4">
                      <span className={s.isActive ? 'text-moss-600' : 'text-rust-500'}>
                        {s.isActive ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <button type="button" onClick={() => toggleStatus(s)} className="text-teal-500 hover:underline dark:text-teal-100">
                        {s.isActive ? t('common.delete') : t('common.activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateStaffForm({ onCreated }) {
  const { t, i18n } = useTranslation();
  const geo = useGeoHierarchy();
  const [departments, setDepartments] = useState([]);
  const [role, setRole] = useState(ROLES.SACHIVALAYAM_STAFF);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listDepartments().then(({ data }) => setDepartments(data.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isValidPhoneNumber(phoneNumber)) return setError(t('errors.validation'));
    if (!minLength(name, 2)) return setError(t('errors.validation'));
    if (!isValidEmail(email)) return setError(t('errors.validation'));

    const jurisdiction = {};
    if (role === ROLES.SACHIVALAYAM_STAFF) {
      if (!geo.selected.districtId || !geo.selected.mandalId || !geo.selected.sachivalayamId || !departmentId) {
        return setError(t('errors.validation'));
      }
      jurisdiction.districtId = geo.selected.districtId;
      jurisdiction.mandalId = geo.selected.mandalId;
      jurisdiction.sachivalayamId = geo.selected.sachivalayamId;
      jurisdiction.departmentId = departmentId;
    } else if (role === ROLES.MANDAL_OFFICER) {
      if (!geo.selected.districtId || !geo.selected.mandalId) return setError(t('errors.validation'));
      jurisdiction.districtId = geo.selected.districtId;
      jurisdiction.mandalId = geo.selected.mandalId;
    } else if (role === ROLES.DISTRICT_OFFICER) {
      if (!geo.selected.districtId) return setError(t('errors.validation'));
      jurisdiction.districtId = geo.selected.districtId;
    }

    setSubmitting(true);
    try {
      await createStaff({ role, phoneNumber, name, email, jurisdiction });
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
          <label className="label-eyebrow">{t('admin.role')}</label>
          <select className="input-field mt-1" value={role} onChange={(e) => setRole(e.target.value)}>
            {CREATABLE_ROLES.map((r) => (
              <option key={r} value={r}>{t(`roles.${r}`, r)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-eyebrow">{t('auth.phoneNumber')}</label>
          <input
            className="input-field mt-1"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </div>
        <div>
          <label className="label-eyebrow">{t('auth.name')}</label>
          <input className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label-eyebrow">{t('auth.email')}</label>
          <input type="email" className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      {role !== ROLES.ADMIN && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GeoSelect label={t('auth.selectDistrict')} value={geo.selected.districtId} onChange={geo.selectDistrict} options={geo.districts} lang={i18n.language} />
          {role !== ROLES.DISTRICT_OFFICER && (
            <GeoSelect label={t('auth.selectMandal')} value={geo.selected.mandalId} onChange={geo.selectMandal} options={geo.mandals} lang={i18n.language} disabled={!geo.selected.districtId} />
          )}
          {role === ROLES.SACHIVALAYAM_STAFF && (
            <>
              <GeoSelect label={t('auth.selectVillage')} value={geo.selected.villageId} onChange={geo.selectVillage} options={geo.villages} lang={i18n.language} disabled={!geo.selected.mandalId} />
              <GeoSelect label={t('auth.selectSachivalayam')} value={geo.selected.sachivalayamId} onChange={geo.selectSachivalayam} options={geo.sachivalayams} lang={i18n.language} disabled={!geo.selected.villageId} />
              <div>
                <label className="label-eyebrow">{t('common.department')}</label>
                <select className="input-field mt-1" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">{t('common.department')}</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name?.[i18n.language] || d.name?.en}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-rust-500">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t('common.loading') : t('admin.createStaff')}
      </button>
    </form>
  );
}

function GeoSelect({ label, value, onChange, options, lang, disabled }) {
  return (
    <div>
      <label className="label-eyebrow">{label}</label>
      <select className="input-field mt-1" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt._id} value={opt._id}>{opt.name?.[lang] || opt.name?.en}</option>
        ))}
      </select>
    </div>
  );
}
