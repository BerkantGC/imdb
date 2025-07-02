<template>
  <header class="bg-surface shadow-lg border-b border-gray-700">
    <nav class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-on-surface">EfeFilm</router-link>
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-on-surface-secondary hover:text-on-surface transition-colors">{{ t('header.home') }}</router-link>
          
          <!-- Authenticated User Navigation -->
          <template v-if="authStore.isAuthenticated">
            <router-link to="/watchlist" class="text-on-surface-secondary hover:text-on-surface transition-colors">{{ t('header.watchlist') }}</router-link>
            <router-link to="/profile" class="text-on-surface-secondary hover:text-on-surface transition-colors">Profile</router-link>
            <span class="text-on-surface-secondary">{{ t('header.welcome', { name: authStore.user?.firstName || 'User' }) }}</span>
            <button @click="handleLogout" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {{ t('header.logout') }}
            </button>
          </template>
          
          <!-- Guest Navigation -->
          <template v-else>
            <router-link to="/login" class="text-on-surface-secondary hover:text-on-surface transition-colors">{{ t('header.login') }}</router-link>
            <router-link to="/register" class="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors">
              {{ t('header.register') }}
            </router-link>
          </template>

          <button @click="toggleLanguage" class="text-on-surface-secondary hover:text-on-surface transition-colors">
            {{ currentLanguage.toUpperCase() }}
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../store/auth';
import { useWatchlistStore } from '../store/watchlist';
import { loadLocaleMessages } from '../i18n';
import i18n from '../i18n';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const watchlistStore = useWatchlistStore();

const currentLanguage = computed(() => locale.value);

const toggleLanguage = async () => {
  const newLang = locale.value === 'en' ? 'tr' : 'en';
  await loadLocaleMessages(i18n, newLang);
  locale.value = newLang;
};

const handleLogout = () => {
  watchlistStore.clearWatchlist();
  authStore.logout();
};
</script>
