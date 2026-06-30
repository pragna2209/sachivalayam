import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGeoHierarchy from '../../hooks/useGeoHierarchy';
import { createGeoNode } from '../../api/geoApi';
import { minLength } from '../../utils/validators';

const LEVELS = ['district', 'mandal', 'village', 'sachivalayam'];

export default function GeoHierarchyManagementPage() {
  const { t, i18n } = useTranslation();
  const geo = useGeoHierarchy();
  const [activeLevel, setActiveLevel] = useState('district');

  const labelKey = {
    district: 'addDistrict',
    mandal: 'addMandal',
    village: 'addVillage',
    sachivalayam: 'addSachivalayam'
  };

  const parentRequiredFor = { district: null, mandal: 'districtId', village: 'mandalId', sachivalayam: 'villageId' };
  const optionsFor = { district: geo.districts, mandal: geo.mandals, village: geo.villages, sachivalayam: geo.sachivalayams };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('admin.geoManagement')}</h1>

      <div className="mt-4 flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setActiveLevel(level)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${
              activeLevel === level ? 'bg-teal-500 text-white' : 'border border-sand-light text-ink dark:border-teal-600 dark:text-ink-dark'
            }`}
          >
            {t(`common.${level === 'village' ? 'village' : level}`, level)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">{t(`admin.${labelKey[activeLevel]}`)}</h2>

          {activeLevel !== 'district' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Picker label={t('auth.selectDistrict')} value={geo.selected.districtId} onChange={geo.selectDistrict} options={geo.districts} lang={i18n.language} />
              {(activeLevel === 'village' || activeLevel === 'sachivalayam') && (
                <Picker label={t('auth.selectMandal')} value={geo.selected.mandalId} onChange={geo.selectMandal} options={geo.mandals} lang={i18n.language} disabled={!geo.selected.districtId} />
              )}
              {activeLevel === 'sachivalayam' && (
                <Picker label={t('auth.selectVillage')} value={geo.selected.villageId} onChange={geo.selectVillage} options={geo.villages} lang={i18n.language} disabled={!geo.selected.mandalId} />
              )}
            </div>
          )}

          <CreateNodeForm
            level={activeLevel}
            parentId={
              activeLevel === 'mandal' ? geo.selected.districtId :
              activeLevel === 'village' ? geo.selected.mandalId :
              activeLevel === 'sachivalayam' ? geo.selected.villageId : null
            }
            parentRequired={!!parentRequiredFor[activeLevel]}
            onCreated={() => {
              if (activeLevel === 'mandal') geo.selectDistrict(geo.selected.districtId);
              if (activeLevel === 'village') geo.selectMandal(geo.selected.mandalId);
              if (activeLevel === 'sachivalayam') geo.selectVillage(geo.selected.villageId);
            }}
          />
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold capitalize">{activeLevel} list</h2>
          <ul className="mt-3 space-y-2">
            {optionsFor[activeLevel].length === 0 ? (
              <p className="text-sm text-sand">{t('common.noResults')}</p>
            ) : (
              optionsFor[activeLevel].map((node) => (
                <li key={node._id} className="card flex items-center justify-between text-sm">
                  <span>{node.name?.[i18n.language] || node.name?.en}</span>
                  <span className="font-mono text-xs text-sand">{node.code}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Picker({ label, value, onChange, options, lang, disabled }) {
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

function CreateNodeForm({ level, parentId, parentRequired, onCreated }) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!minLength(code, 1) || !minLength(nameEn, 1) || !minLength(nameTe, 1) || !minLength(nameHi, 1)) {
      return setError(t('errors.validation'));
    }
    if (parentRequired && !parentId) return setError(t('errors.validation'));

    setSubmitting(true);
    try {
      await createGeoNode(level, {
        code,
        name: { en: nameEn, te: nameTe, hi: nameHi },
        parentId: parentId || undefined
      });
      setCode('');
      setNameEn('');
      setNameTe('');
      setNameHi('');
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label-eyebrow">Code</label>
          <input className="input-field mt-1" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
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
      {error && <p className="text-sm text-rust-500">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t('common.loading') : t('common.save')}
      </button>
    </form>
  );
}
