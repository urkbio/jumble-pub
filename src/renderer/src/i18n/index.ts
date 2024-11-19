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

i18n.services.formatter?.add('date', (value, lng) => {
  console.log('lng', lng)
  if (lng?.startsWith('zh')) {
    return dayjs(value).format('YYYY-MM-DD')
  }
  return dayjs(value).format('MMM D, YYYY')
})

export default i18n
