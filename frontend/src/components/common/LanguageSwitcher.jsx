import { useTranslation } from 'react-i18next';
import useLanguageStore from '../../store/languageStore';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <select
      aria-label="Select language"
      value={i18n.language}
      onChange={(e) => setLanguage(e.target.value)}
      className={
        compact
          ? 'rounded border border-sand-light bg-transparent px-2 py-1 text-xs text-ink dark:text-ink-dark dark:border-teal-600'
          : 'input-field max-w-[140px]'
      }
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
