import { create } from 'zustand';
import i18n from '../i18n';

const useLanguageStore = create((set) => ({
  language: i18n.language || 'en',
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
    set({ language: lang });
  }
}));

// Keep <html lang> correct on initial load too.
document.documentElement.setAttribute('lang', i18n.language || 'en');

export default useLanguageStore;
