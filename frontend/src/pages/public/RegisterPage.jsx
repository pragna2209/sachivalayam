import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requestOtp, verifyOtp, registerWithPassword } from '../../api/authApi';
import {
  isValidPhoneNumber,
  isValidEmail,
  isValidPincode,
  isValidAadhaar,
  minLength
} from '../../utils/validators';
import OtpInput from '../../components/auth/OtpInput';
import useAuth from '../../hooks/useAuth';
import useGeoHierarchy from '../../hooks/useGeoHierarchy';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  // 'otp' | 'password' - two fully independent registration paths. The
  // OTP path verifies phone ownership before creating the account; the
  // password path does not verify the phone number at all (confirmed
  // deliberate tradeoff - see PasswordRegisterForm below).
  const [mode, setMode] = useState('otp');

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">{t('auth.register')}</h1>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('otp')}
          className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'otp' ? 'bg-teal-500 text-white' : 'border border-sand-light text-ink dark:border-teal-600 dark:text-ink-dark'
          }`}
        >
          {t('auth.registerWithOtp')}
        </button>
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'password' ? 'bg-teal-500 text-white' : 'border border-sand-light text-ink dark:border-teal-600 dark:text-ink-dark'
          }`}
        >
          {t('auth.registerWithPassword')}
        </button>
      </div>

      {mode === 'otp' ? (
        <OtpRegisterForm setSession={setSession} navigate={navigate} t={t} i18n={i18n} />
      ) : (
        <PasswordRegisterForm setSession={setSession} navigate={navigate} t={t} i18n={i18n} />
      )}

      <p className="mt-6 text-center text-sm text-sand">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-teal-500 hover:underline dark:text-teal-100">
          {t('auth.logInInstead')}
        </Link>
      </p>
    </div>
  );
}

/**
 * Original OTP-based registration flow (phone -> OTP -> profile),
 * unchanged in behavior from before - phone ownership is verified via
 * OTP before the account is created.
 */
function OtpRegisterForm({ setSession, navigate, t, i18n }) {
  const geo = useGeoHierarchy();

  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    if (!isValidPhoneNumber(phoneNumber)) {
      setError(t('errors.validation'));
      return;
    }
    setLoading(true);
    try {
      await requestOtp({ phoneNumber, purpose: 'REGISTER' });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }

  function handleVerifyOtpStep(e) {
    e.preventDefault();
    if (otp.length < 4) {
      setError(t('errors.validation'));
      return;
    }
    setError('');
    setStep('profile');
  }

  async function handleCompleteRegistration(e) {
    e.preventDefault();
    setError('');

    if (!minLength(name, 2)) return setError(t('errors.validation'));
    if (email && !isValidEmail(email)) return setError(t('errors.validation'));
    if (aadhaarNumber && !isValidAadhaar(aadhaarNumber)) return setError(t('errors.validation'));
    if (!minLength(addressLine1, 1)) return setError(t('errors.validation'));
    if (!isValidPincode(pincode)) return setError(t('errors.validation'));
    if (!geo.selected.districtId || !geo.selected.mandalId || !geo.selected.villageId || !geo.selected.sachivalayamId) {
      return setError(t('errors.validation'));
    }

    setLoading(true);
    try {
      const { data } = await verifyOtp({
        phoneNumber,
        otp,
        purpose: 'REGISTER',
        name,
        email: email || undefined,
        aadhaarNumber: aadhaarNumber || undefined,
        preferredLanguage: i18n.language,
        address: {
          line1: addressLine1,
          pincode,
          districtId: geo.selected.districtId,
          mandalId: geo.selected.mandalId,
          villageId: geo.selected.villageId,
          sachivalayamId: geo.selected.sachivalayamId
        }
      });
      setSession(data.data);
      navigate('/citizen/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
          <div>
            <label className="label-eyebrow" htmlFor="reg-phone">{t('auth.phoneNumber')}</label>
            <input
              id="reg-phone"
              className="input-field mt-1"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t('auth.phoneNumberPlaceholder')}
              inputMode="numeric"
            />
          </div>
          {error && <p className="text-sm text-rust-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.sendOtp')}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtpStep} className="mt-6 space-y-4">
          <p className="text-sm text-sand">
            {t('auth.otpSentTo')} <span className="font-mono">{phoneNumber}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-sm text-rust-500">{error}</p>}
          <button type="submit" className="btn-primary w-full">{t('common.next')}</button>
        </form>
      )}

      {step === 'profile' && (
        <form onSubmit={handleCompleteRegistration} className="mt-6 space-y-4">
          <p className="label-eyebrow">{t('auth.completeProfile')}</p>

          <div>
            <label className="label-eyebrow" htmlFor="reg-name">{t('auth.name')}</label>
            <input id="reg-name" className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="reg-email">{t('auth.email')} ({t('common.optional')})</label>
            <input id="reg-email" type="email" className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="reg-aadhaar">{t('auth.aadhaarNumber')} ({t('common.optional')})</label>
            <input
              id="reg-aadhaar"
              className="input-field mt-1"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            />
            <p className="mt-1 text-xs text-sand">{t('auth.aadhaarHelp')}</p>
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="reg-address">{t('auth.addressLine1')}</label>
            <input id="reg-address" className="input-field mt-1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="reg-pincode">{t('auth.pincode')}</label>
            <input
              id="reg-pincode"
              className="input-field mt-1"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          <GeoSelect label={t('auth.selectDistrict')} value={geo.selected.districtId} onChange={geo.selectDistrict} options={geo.districts} lang={i18n.language} />
          <GeoSelect label={t('auth.selectMandal')} value={geo.selected.mandalId} onChange={geo.selectMandal} options={geo.mandals} lang={i18n.language} disabled={!geo.selected.districtId} />
          <GeoSelect label={t('auth.selectVillage')} value={geo.selected.villageId} onChange={geo.selectVillage} options={geo.villages} lang={i18n.language} disabled={!geo.selected.mandalId} />
          <GeoSelect label={t('auth.selectSachivalayam')} value={geo.selected.sachivalayamId} onChange={geo.selectSachivalayam} options={geo.sachivalayams} lang={i18n.language} disabled={!geo.selected.villageId} />

          {error && <p className="text-sm text-rust-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.register')}
          </button>
        </form>
      )}
    </>
  );
}

/**
 * Direct password registration - phone number + password, name, address,
 * all in a single step, no OTP. Per explicit confirmation: this does NOT
 * verify that the phone number actually belongs to the registrant. The
 * notice below is shown unconditionally so this tradeoff is visible to
 * the person registering, not hidden from them.
 */
function PasswordRegisterForm({ setSession, navigate, t, i18n }) {
  const geo = useGeoHierarchy();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isValidPhoneNumber(phoneNumber)) return setError(t('errors.validation'));
    if (!password || password.length < 8) return setError(t('errors.validation'));
    if (password !== confirmPassword) return setError(t('auth.passwordMismatch'));
    if (!minLength(name, 2)) return setError(t('errors.validation'));
    if (email && !isValidEmail(email)) return setError(t('errors.validation'));
    if (aadhaarNumber && !isValidAadhaar(aadhaarNumber)) return setError(t('errors.validation'));
    if (!minLength(addressLine1, 1)) return setError(t('errors.validation'));
    if (!isValidPincode(pincode)) return setError(t('errors.validation'));
    if (!geo.selected.districtId || !geo.selected.mandalId || !geo.selected.villageId || !geo.selected.sachivalayamId) {
      return setError(t('errors.validation'));
    }

    setLoading(true);
    try {
      const { data } = await registerWithPassword({
        phoneNumber,
        password,
        name,
        email: email || undefined,
        aadhaarNumber: aadhaarNumber || undefined,
        preferredLanguage: i18n.language,
        address: {
          line1: addressLine1,
          pincode,
          districtId: geo.selected.districtId,
          mandalId: geo.selected.mandalId,
          villageId: geo.selected.villageId,
          sachivalayamId: geo.selected.sachivalayamId
        }
      });
      setSession(data.data);
      navigate('/citizen/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <p className="rounded border border-rust-300 bg-rust-50 px-3 py-2 text-xs text-rust-600">
        {t('auth.noPhoneVerificationNotice')}
      </p>

      <div>
        <label className="label-eyebrow" htmlFor="pwreg-phone">{t('auth.phoneNumber')}</label>
        <input
          id="pwreg-phone"
          className="input-field mt-1"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder={t('auth.phoneNumberPlaceholder')}
          inputMode="numeric"
        />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-password">{t('auth.password')}</label>
        <input
          id="pwreg-password"
          type="password"
          className="input-field mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-confirm-password">{t('auth.confirmPassword')}</label>
        <input
          id="pwreg-confirm-password"
          type="password"
          className="input-field mt-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-name">{t('auth.name')}</label>
        <input id="pwreg-name" className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-email">{t('auth.email')} ({t('common.optional')})</label>
        <input id="pwreg-email" type="email" className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-aadhaar">{t('auth.aadhaarNumber')} ({t('common.optional')})</label>
        <input
          id="pwreg-aadhaar"
          className="input-field mt-1"
          value={aadhaarNumber}
          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
        />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-address">{t('auth.addressLine1')}</label>
        <input id="pwreg-address" className="input-field mt-1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
      </div>
      <div>
        <label className="label-eyebrow" htmlFor="pwreg-pincode">{t('auth.pincode')}</label>
        <input
          id="pwreg-pincode"
          className="input-field mt-1"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
      </div>

      <GeoSelect label={t('auth.selectDistrict')} value={geo.selected.districtId} onChange={geo.selectDistrict} options={geo.districts} lang={i18n.language} />
      <GeoSelect label={t('auth.selectMandal')} value={geo.selected.mandalId} onChange={geo.selectMandal} options={geo.mandals} lang={i18n.language} disabled={!geo.selected.districtId} />
      <GeoSelect label={t('auth.selectVillage')} value={geo.selected.villageId} onChange={geo.selectVillage} options={geo.villages} lang={i18n.language} disabled={!geo.selected.mandalId} />
      <GeoSelect label={t('auth.selectSachivalayam')} value={geo.selected.sachivalayamId} onChange={geo.selectSachivalayam} options={geo.sachivalayams} lang={i18n.language} disabled={!geo.selected.villageId} />

      {error && <p className="text-sm text-rust-500">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? t('common.loading') : t('auth.register')}
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
