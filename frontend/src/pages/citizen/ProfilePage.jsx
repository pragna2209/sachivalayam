import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyProfile, updateMyProfile } from '../../api/staffApi';
import { setPassword as setPasswordApi } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';
import useGeoHierarchy from '../../hooks/useGeoHierarchy';
import useLanguageStore from '../../store/languageStore';
import { isValidEmail, minLength } from '../../utils/validators';
import { ROLES, SUPPORTED_LANGUAGES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { updateUser } = useAuth();
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const geo = useGeoHierarchy();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(i18n.language);
  const [addressLine1, setAddressLine1] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(({ data }) => {
        const p = data.data;
        setProfile(p);
        setName(p.name || '');
        setEmail(p.email || '');
        setPreferredLanguage(p.preferredLanguage || 'en');
        if (p.address) {
          setAddressLine1(p.address.line1 || '');
          setPincode(p.address.pincode || '');
          if (p.address.districtId) geo.selectDistrict(p.address.districtId);
        }
      })
      .finally(() => setLoading(false));
    // geo intentionally omitted from deps - cascading selects are driven
    // imperatively once on initial load, not re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!minLength(name, 2)) return setError(t('errors.validation'));
    if (email && !isValidEmail(email)) return setError(t('errors.validation'));

    setSaving(true);
    try {
      const payload = { name, email: email || undefined, preferredLanguage };
      if (profile.role === ROLES.CITIZEN) {
        payload.address = {
          line1: addressLine1,
          pincode,
          districtId: geo.selected.districtId || undefined,
          mandalId: geo.selected.mandalId || undefined,
          villageId: geo.selected.villageId || undefined,
          sachivalayamId: geo.selected.sachivalayamId || undefined
        };
      }
      const { data } = await updateMyProfile(payload);
      updateUser(data.data);
      setLanguage(preferredLanguage);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-semibold">{t('profile.title')}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section className="card space-y-4">
          <h2 className="font-display text-base font-semibold">{t('profile.personalInfo')}</h2>
          <div>
            <label className="label-eyebrow" htmlFor="profile-name">{t('auth.name')}</label>
            <input id="profile-name" className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="profile-email">{t('auth.email')}</label>
            <input id="profile-email" type="email" className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="profile-phone">{t('auth.phoneNumber')}</label>
            <input id="profile-phone" disabled className="input-field mt-1 opacity-60" value={profile.phoneNumber} />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="profile-lang">{t('profile.languagePreference')}</label>
            <select
              id="profile-lang"
              className="input-field mt-1"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </section>

        {profile.role === ROLES.CITIZEN && (
          <section className="card space-y-4">
            <h2 className="font-display text-base font-semibold">{t('profile.addressInfo')}</h2>
            <div>
              <label className="label-eyebrow" htmlFor="profile-address">{t('auth.addressLine1')}</label>
              <input id="profile-address" className="input-field mt-1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
            </div>
            <div>
              <label className="label-eyebrow" htmlFor="profile-pincode">{t('auth.pincode')}</label>
              <input
                id="profile-pincode"
                className="input-field mt-1"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <GeoSelect label={t('auth.selectDistrict')} value={geo.selected.districtId} onChange={geo.selectDistrict} options={geo.districts} lang={i18n.language} />
            <GeoSelect label={t('auth.selectMandal')} value={geo.selected.mandalId} onChange={geo.selectMandal} options={geo.mandals} lang={i18n.language} disabled={!geo.selected.districtId} />
            <GeoSelect label={t('auth.selectVillage')} value={geo.selected.villageId} onChange={geo.selectVillage} options={geo.villages} lang={i18n.language} disabled={!geo.selected.mandalId} />
            <GeoSelect label={t('auth.selectSachivalayam')} value={geo.selected.sachivalayamId} onChange={geo.selectSachivalayam} options={geo.sachivalayams} lang={i18n.language} disabled={!geo.selected.villageId} />
          </section>
        )}

        {error && <p className="text-sm text-rust-500">{error}</p>}
        {saved && <p className="text-sm text-moss-600">{t('profile.savedSuccessfully')}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? t('common.loading') : t('profile.saveChanges')}
        </button>
      </form>

      <SetPasswordSection />
    </div>
  );
}

/**
 * Lets an already-logged-in user (via OTP or an existing password) set
 * or change their password. Kept as a separate form/submit from the main
 * profile-fields form above, so saving a name/address change can never
 * accidentally also submit a password field, and vice versa.
 */
function SetPasswordSection() {
  const { t } = useTranslation();
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!password || password.length < 8) {
      setError(t('errors.validation'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await setPasswordApi({ password });
      setPasswordValue('');
      setConfirmPassword('');
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
      <h2 className="font-display text-base font-semibold">{t('auth.setPassword')}</h2>
      <p className="text-xs text-sand">{t('auth.setPasswordHelp')}</p>

      <div>
        <label className="label-eyebrow" htmlFor="profile-new-password">{t('auth.password')}</label>
        <input
          id="profile-new-password"
          type="password"
          className="input-field mt-1"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="profile-confirm-password">{t('auth.confirmPassword')}</label>
        <input
          id="profile-confirm-password"
          type="password"
          className="input-field mt-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-rust-500">{error}</p>}
      {saved && <p className="text-sm text-moss-600">{t('auth.password.set', 'Password set successfully')}</p>}

      <button type="submit" disabled={saving} className="btn-secondary w-full sm:w-auto">
        {saving ? t('common.loading') : t('auth.setPassword')}
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
