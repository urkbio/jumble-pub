import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en'
import zh from './zh'
import dayjs from 'dayjs'

const resources = {
  en,
  zh
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

i18n.services.formatter?.add('date', (timestamp, lng) => {
  if (lng?.startsWith('zh')) {
    return dayjs(timestamp).format('YYYY/MM/DD')
  }
  return dayjs(timestamp).format('MMM D, YYYY')
})

export default i18n
