import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();

  const steps = [
    { key: 'step1', node: 'is-complete' },
    { key: 'step2', node: 'is-complete' },
    { key: 'step3', node: 'is-complete' },
    { key: 'step4', node: 'is-current' }
  ];

  return (
    <div>
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{t('landing.title')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-sand">{t('landing.subtitle')}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="btn-primary">{t('landing.ctaLogin')}</Link>
            <Link to="/register" className="btn-secondary">{t('landing.ctaRegister')}</Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/anonymous/report" className="text-rust-500 hover:underline">
              {t('landing.ctaAnonymous')}
            </Link>
            <span className="text-sand-light">·</span>
            <Link to="/anonymous/track" className="text-teal-500 hover:underline dark:text-teal-100">
              {t('landing.ctaTrack')}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-sand-light/60 bg-white px-4 py-16 dark:border-teal-700 dark:bg-teal-700/20 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-display text-2xl font-semibold">{t('landing.howItWorksTitle')}</h2>
          <div className="status-thread mt-10">
            {steps.map((step) => (
              <div key={step.key} className="relative pb-8 last:pb-0">
                <span className={`status-node ${step.node}`} aria-hidden="true" />
                <div className="pl-1">
                  <p className="font-display text-base font-medium">{t(`landing.${step.key}Title`)}</p>
                  <p className="mt-1 text-sm text-sand">{t(`landing.${step.key}Body`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
