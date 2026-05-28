import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import common from '@/mock/languages/common.json'
import indicationDetail from '@/mock/languages/indication/indication-detail.json'
import indicationListing from '@/mock/languages/indication/indication-listing.json'
import menu from '@/mock/languages/menu/menu.json'

const mergeTranslations = (lang: string) => ({
  ...common[lang as keyof typeof common],
  ...indicationDetail[lang as keyof typeof indicationDetail],
  ...indicationListing[lang as keyof typeof indicationListing],
  ...menu[lang as keyof typeof menu],
})

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: mergeTranslations('pt-BR') },
    'en-US': { translation: mergeTranslations('en-US') },
    'es-ES': { translation: mergeTranslations('es-ES') },
  },
  lng: localStorage.getItem('app-language') || 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
})

export default i18n
