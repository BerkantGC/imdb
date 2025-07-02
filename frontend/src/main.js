import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import i18n, { loadLocaleMessages } from './i18n'
import './style.css'

async function bootstrap() {
  const app = createApp(App)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  const browserLang = navigator.language.split('-')[0]
  loadLocaleMessages(['en', 'tr'].includes(browserLang) ? browserLang : 'en')

  app.mount('#app')
}

bootstrap()
