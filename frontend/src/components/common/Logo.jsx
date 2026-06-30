import { useTranslation } from 'react-i18next';

/**
 * The app's logo: a circular seal/stamp shape - the classic visual
 * language of an official government emblem (concentric ring, gold inner
 * border) - containing the same three-node "status-thread" motif used
 * for the complaint timeline and sidebar active-state elsewhere in the
 * app (a complaint's progression through stages/hierarchy).
 *
 * This is a generic, original mark, NOT a reproduction of any real
 * government seal or the actual AP Sachivalayam emblem - recreating an
 * official government symbol isn't something this generates. If a real
 * logo file is supplied later, swap this component's contents for an
 * <img> tag pointing at that asset; every place that renders <Logo />
 * elsewhere in the app stays unchanged.
 */
export default function Logo({ size = 30, showText = true, className = '' }) {
  const { t } = useTranslation();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Outer seal ring */}
        <circle cx="16" cy="16" r="15" fill="currentColor" className="text-teal-500 dark:text-teal-300" />
        {/* Gold inner ring - the "official stamp" accent, used nowhere
            else as a fill/background, only here as a thin formal border */}
        <circle cx="16" cy="16" r="12" fill="none" stroke="#F9A825" strokeWidth="1.1" />
        {/* Status-thread motif: three nodes converging, echoing the
            complaint-timeline component elsewhere in the app */}
        <circle cx="16" cy="10" r="2.1" fill="white" />
        <circle cx="11.3" cy="19.5" r="2.1" fill="white" fillOpacity="0.6" />
        <circle cx="20.7" cy="19.5" r="2.1" fill="white" fillOpacity="0.85" />
        <path
          d="M16 11.8L11.9 18M16 11.8L20.1 18"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </svg>
      {showText && (
        <span className="font-display text-lg font-semibold text-teal-500 dark:text-teal-100">
          {t('common.brandShort')}
        </span>
      )}
    </span>
  );
}
