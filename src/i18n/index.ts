import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LANGUAGE_EN, LANGUAGE_VI } from '@/constants';
import { getLanguage } from '@/utils';

import enLocale from '@/assets/locales/en/translation.json';
import viLocale from '@/assets/locales/vi/translation.json';

i18next.use(initReactI18next).init({
  lng: getLanguage(),
  fallbackLng: [LANGUAGE_VI, LANGUAGE_EN],
  resources: {
    vi: {
      translation: viLocale,
    },
    en: {
      translation: enLocale,
    },
  },
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  debug: import.meta.env.DEV,
});

export default i18next;
