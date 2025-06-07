import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Recursos de traducción
const resources = {
  es: {
    common: require('../public/locales/es/common.json'),
    auth: require('../public/locales/es/auth.json'),
    chat: require('../public/locales/es/chat.json'),
    rooms: require('../public/locales/es/rooms.json'),
    profile: require('../public/locales/es/profile.json'),
  },
  en: {
    common: require('../public/locales/en/common.json'),
    auth: require('../public/locales/en/auth.json'),
    chat: require('../public/locales/en/chat.json'),
    rooms: require('../public/locales/en/rooms.json'),
    profile: require('../public/locales/en/profile.json'),
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma por defecto
    fallbackLng: 'es', // idioma de respaldo
    
    // Configuración del detector de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Configuración de namespaces
    defaultNS: 'common',
    ns: ['common', 'auth', 'chat', 'rooms', 'profile'],

    // Debug en desarrollo
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
