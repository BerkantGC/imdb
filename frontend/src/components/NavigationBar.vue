<template>
  <header class="cosmic-nav bg-charcoal/90 backdrop-blur-lg border-b border-neon/30 shadow-cyber sticky top-0 z-50">
    <nav class="cosmic-container mx-auto px-8 py-5">
      <div class="flex justify-between items-center">
        <router-link to="/" class="brand-logo text-2xl font-cyber font-bold text-neon cyber-neon-text animate-glow">
          GrandChamp
        </router-link>
        
        <div class="navigation-cluster flex items-center space-x-8">
          <router-link 
            to="/" 
            class="nav-quantum text-silver hover:text-neon transition-all duration-300 font-medium tracking-wide"
          >
            {{ t('navigation.portal') }}
          </router-link>
          
          <!-- Authenticated User Navigation -->
          <template v-if="isAuthenticated">
            <router-link 
              to="/watchlist" 
              class="nav-quantum text-silver hover:text-neon transition-all duration-300 font-medium tracking-wide"
            >
              {{ t('navigation.vault') }}
            </router-link>
            
            <router-link 
              to="/profile" 
              class="nav-quantum text-silver hover:text-neon transition-all duration-300 font-medium tracking-wide"
            >
              {{ t('navigation.profile') }}
            </router-link>

            <div class="user-profile-capsule flex items-center space-x-4">
              <span class="user-greeting text-silver/80 font-cyber text-sm">
                {{ t('navigation.greetings', { username: userName }) }}
              </span>
              <button 
                @click="executeLogout" 
                class="logout-quantum bg-gradient-to-r from-crimson to-crimson-deep hover:from-crimson-deep hover:to-crimson text-platinum font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-crimson hover:shadow-lg transform hover:scale-105"
              >
                {{ t('navigation.disconnect') }}
              </button>
            </div>
          </template>
          
          <!-- Guest Navigation -->
          <template v-else>
            <div class="auth-cluster flex items-center space-x-4">
              <router-link 
                to="/login" 
                class="access-portal text-silver hover:text-neon transition-all duration-300 font-medium tracking-wide"
              >
                {{ t('navigation.access') }}
              </router-link>
              <router-link 
                to="/register" 
                class="init-quantum bg-gradient-to-r from-royal to-royal-deep hover:from-royal-deep hover:to-royal text-platinum font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                {{ t('navigation.initialize') }}
              </router-link>
            </div>
          </template>

          <button 
            @click="toggleDialect" 
            class="language-quantum bg-charcoal border border-neon/50 text-neon hover:bg-neon hover:text-obsidian font-cyber text-xs py-2 px-3 rounded-lg transition-all duration-300 shadow-neon"
          >
            {{ activeDialect.toUpperCase() }}
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../store/auth'; // Add regular auth store
import { loadLocaleMessages } from '../i18n';
import i18n from '../i18n';

const { t, locale } = useI18n();
const authStore = useAuthStore(); // Add regular auth store


const activeDialect = computed(() => locale.value);

// Check both auth systems for authentication status
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Get user name from either auth system
const userName = computed(() => {
  if (authStore.user) {
    return authStore.user.firstName;
  }
  return 'User';
});

const toggleDialect = async () => {
  const newDialect = locale.value === 'en' ? 'tr' : 'en';
  await loadLocaleMessages(i18n, newDialect);
  locale.value = newDialect;
};

const executeLogout = () => {
  authStore.logout();
};
</script>

<style scoped>
.cosmic-nav {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cosmic-container {
  max-width: 1400px;
}

.brand-logo {
  letter-spacing: 0.1em;
}

.nav-quantum {
  position: relative;
  overflow: hidden;
}

.nav-quantum::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #66FCF1, #45A29E);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-quantum:hover::before {
  width: 100%;
}

.cyber-neon-text {
  text-shadow: 0 0 10px rgba(102, 252, 241, 0.8);
}

@keyframes glow {
  0% { text-shadow: 0 0 5px rgba(102, 252, 241, 0.5); }
  100% { text-shadow: 0 0 20px rgba(102, 252, 241, 0.8), 0 0 30px rgba(102, 252, 241, 0.6); }
}
</style>
