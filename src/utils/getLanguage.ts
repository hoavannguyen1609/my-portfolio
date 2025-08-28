import { LANGUAGE_KEY, LANGUAGE_VI } from '@/constants';

const getLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(LANGUAGE_KEY) || LANGUAGE_VI;
  }

  return LANGUAGE_VI;
};

export default getLanguage;
