import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useGeoHierarchy from '../../hooks/useGeoHierarchy';
import { listCategories } from '../../api/categoryApi';
import MapLocationPicker from '../map/MapLocationPicker';
import FileUploadWidget from '../upload/FileUploadWidget';
import { isValidPincode, minLength } from '../../utils/validators';

/**
 * Shared complaint form. When `sensitiveOnly` is true (the anonymous
 * reporting flow), the category list is filtered to isSensitive categories
 * only, matching the backend's enforcement in anonymous.service.js.
 */
export default function ComplaintForm({ sensitiveOnly = false, onSubmit, submitting, submitLabel }) {
  const { t, i18n } = useTranslation();
  const geo = useGeoHierarchy();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [pincode, setPincode] = useState('');
  const [mapLocationLabel, setMapLocationLabel] = useState('');
  const [coords, setCoords] = useState(null);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    listCategories({ isSensitive: sensitiveOnly ? true : undefined })
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, [sensitiveOnly]);

  function validate() {
    const nextErrors = {};
    if (!minLength(title, 5)) nextErrors.title = t('errors.validation');
    if (!minLength(description, 10)) nextErrors.description = t('errors.validation');
    if (!categoryId) nextErrors.categoryId = t('errors.validation');
    if (!minLength(addressLine1, 1)) nextErrors.addressLine1 = t('errors.validation');
    if (!isValidPincode(pincode)) nextErrors.pincode = t('errors.validation');
    if (!coords) nextErrors.coords = t('errors.validation');
    if (!geo.selected.districtId) nextErrors.districtId = t('errors.validation');
    if (!geo.selected.mandalId) nextErrors.mandalId = t('errors.validation');
    if (!geo.selected.villageId) nextErrors.villageId = t('errors.validation');
    if (!geo.selected.sachivalayamId) nextErrors.sachivalayamId = t('errors.validation');
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      payload: {
        title,
        description,
        categoryId,
        address: { line1: addressLine1, pincode },
        gpsLocation: { coordinates: [coords.lng, coords.lat] },
        mapLocationLabel,
        districtId: geo.selected.districtId,
        mandalId: geo.selected.mandalId,
        villageId: geo.selected.villageId,
        sachivalayamId: geo.selected.sachivalayamId
      },
      files
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">{t('complaint.description')}</h2>

        <div>
          <label className="label-eyebrow" htmlFor="complaint-title">{t('complaint.title')}</label>
          <input
            id="complaint-title"
            className="input-field mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('complaint.titlePlaceholder')}
          />
          {errors.title && <p className="mt-1 text-xs text-rust-500">{errors.title}</p>}
        </div>

        <div>
          <label className="label-eyebrow" htmlFor="complaint-description">{t('complaint.description')}</label>
          <textarea
            id="complaint-description"
            rows={4}
            className="input-field mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('complaint.descriptionPlaceholder')}
          />
          {errors.description && <p className="mt-1 text-xs text-rust-500">{errors.description}</p>}
        </div>

        <div>
          <label className="label-eyebrow" htmlFor="complaint-category">{t('complaint.category')}</label>
          <select
            id="complaint-category"
            className="input-field mt-1"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t('complaint.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name?.[i18n.language] || cat.name?.en}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-rust-500">{errors.categoryId}</p>}
          {sensitiveOnly && <p className="mt-1 text-xs text-sand">{t('anonymous.categoryNotice')}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">{t('complaint.location')}</h2>

        <div>
          <label className="label-eyebrow" htmlFor="complaint-address">{t('complaint.address')}</label>
          <input
            id="complaint-address"
            className="input-field mt-1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder={t('complaint.addressPlaceholder')}
          />
          {errors.addressLine1 && <p className="mt-1 text-xs text-rust-500">{errors.addressLine1}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-eyebrow" htmlFor="complaint-pincode">{t('complaint.pincode')}</label>
            <input
              id="complaint-pincode"
              className="input-field mt-1"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
            />
            {errors.pincode && <p className="mt-1 text-xs text-rust-500">{errors.pincode}</p>}
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="complaint-map-label">{t('complaint.location')} ({t('common.optional')})</label>
            <input
              id="complaint-map-label"
              className="input-field mt-1"
              value={mapLocationLabel}
              onChange={(e) => setMapLocationLabel(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GeoSelect label={t('auth.selectDistrict')} value={geo.selected.districtId} onChange={geo.selectDistrict} options={geo.districts} lang={i18n.language} error={errors.districtId} />
          <GeoSelect label={t('auth.selectMandal')} value={geo.selected.mandalId} onChange={geo.selectMandal} options={geo.mandals} lang={i18n.language} disabled={!geo.selected.districtId} error={errors.mandalId} />
          <GeoSelect label={t('auth.selectVillage')} value={geo.selected.villageId} onChange={geo.selectVillage} options={geo.villages} lang={i18n.language} disabled={!geo.selected.mandalId} error={errors.villageId} />
          <GeoSelect label={t('auth.selectSachivalayam')} value={geo.selected.sachivalayamId} onChange={geo.selectSachivalayam} options={geo.sachivalayams} lang={i18n.language} disabled={!geo.selected.villageId} error={errors.sachivalayamId} />
        </div>

        <div>
          <label className="label-eyebrow">{t('complaint.pinOnMap')}</label>
          <div className="mt-1">
            <MapLocationPicker value={coords} onChange={setCoords} />
          </div>
          {errors.coords && <p className="mt-1 text-xs text-rust-500">{errors.coords}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">{t('complaint.evidence')}</h2>
        <p className="text-sm text-sand">{t('complaint.evidenceHelp')}</p>
        <FileUploadWidget files={files} onFilesChange={setFiles} />
      </section>

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting ? t('common.loading') : submitLabel || t('complaint.submitComplaint')}
      </button>
    </form>
  );
}

function GeoSelect({ label, value, onChange, options, lang, disabled, error }) {
  return (
    <div>
      <label className="label-eyebrow">{label}</label>
      <select
        className="input-field mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt._id} value={opt._id}>
            {opt.name?.[lang] || opt.name?.en}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rust-500">{error}</p>}
    </div>
  );
}
