import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'es', // idioma por defecto
    fallbackLng: 'es', // idioma de respaldo

    // Configuración del backend HTTP
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

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
  })

export default i18n
