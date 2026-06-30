import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requestOtp, verifyOtp, loginWithPassword } from '../../api/authApi';
import { isValidPhoneNumber } from '../../utils/validators';
import OtpInput from '../../components/auth/OtpInput';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const ROLE_HOME = {
  [ROLES.CITIZEN]: '/citizen/dashboard',
  [ROLES.SACHIVALAYAM_STAFF]: '/staff/dashboard',
  [ROLES.MANDAL_OFFICER]: '/officer/dashboard',
  [ROLES.DISTRICT_OFFICER]: '/officer/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard'
};

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();

  // 'otp' | 'password' - which login method is active. Switching modes
  // resets the form back to entering a phone number, so the two flows
  // never share leftover state with each other.
  const [mode, setMode] = useState('otp');
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep('phone');
    setOtp('');
    setPassword('');
    setError('');
  }

  function startResendTimer() {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function navigateAfterLogin(sessionData) {
    setSession(sessionData);
    const redirectTo = location.state?.from?.pathname || ROLE_HOME[sessionData.user.role] || '/';
    navigate(redirectTo, { replace: true });
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    if (!isValidPhoneNumber(phoneNumber)) {
      setError(t('errors.validation'));
      return;
    }
    setLoading(true);
    try {
      await requestOtp({ phoneNumber, purpose: 'LOGIN' });
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ phoneNumber, otp, purpose: 'LOGIN' });
      navigateAfterLogin(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    if (!isValidPhoneNumber(phoneNumber)) {
      setError(t('errors.validation'));
      return;
    }
    if (!password) {
      setError(t('errors.validation'));
      return;
    }
    setLoading(true);
    try {
      const { data } = await loginWithPassword({ phoneNumber, password });
      navigateAfterLogin(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">{t('auth.login')}</h1>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => switchMode('otp')}
          className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'otp' ? 'bg-teal-500 text-white' : 'border border-sand-light text-ink dark:border-teal-600 dark:text-ink-dark'
          }`}
        >
          {t('auth.loginWithOtp')}
        </button>
        <button
          type="button"
          onClick={() => switchMode('password')}
          className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'password' ? 'bg-teal-500 text-white' : 'border border-sand-light text-ink dark:border-teal-600 dark:text-ink-dark'
          }`}
        >
          {t('auth.loginWithPassword')}
        </button>
      </div>

      {mode === 'otp' && step === 'phone' && (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
          <div>
            <label className="label-eyebrow" htmlFor="login-phone">{t('auth.phoneNumber')}</label>
            <input
              id="login-phone"
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

      {mode === 'otp' && step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
          <p className="text-sm text-sand">
            {t('auth.otpSentTo')} <span className="font-mono">{phoneNumber}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-sm text-rust-500">{error}</p>}
          <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.verifyAndContinue')}
          </button>
          <button
            type="button"
            disabled={resendTimer > 0}
            onClick={() => {
              requestOtp({ phoneNumber, purpose: 'LOGIN' });
              startResendTimer();
            }}
            className="w-full text-sm text-teal-500 disabled:text-sand dark:text-teal-100"
          >
            {resendTimer > 0 ? t('auth.resendIn', { seconds: resendTimer }) : t('auth.resendOtp')}
          </button>
        </form>
      )}

      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
          <div>
            <label className="label-eyebrow" htmlFor="login-phone-pw">{t('auth.phoneNumber')}</label>
            <input
              id="login-phone-pw"
              className="input-field mt-1"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t('auth.phoneNumberPlaceholder')}
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="label-eyebrow" htmlFor="login-password">{t('auth.password')}</label>
            <input
              id="login-password"
              type="password"
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-rust-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-sand">
        {t('auth.newHere')}{' '}
        <Link to="/register" className="text-teal-500 hover:underline dark:text-teal-100">
          {t('auth.createOne')}
        </Link>
      </p>
    </div>
  );
}
