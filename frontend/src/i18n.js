import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import tr from './locales/tr.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    tr
  }
})

// Bu fonksiyon sadece ihtiyaç kalırsa dil değiştirmek için kullanılabilir
export function loadLocaleMessages(locale) {
  if (!['en', 'tr'].includes(locale)) return
  i18n.global.locale.value = locale
}

export default i18n
