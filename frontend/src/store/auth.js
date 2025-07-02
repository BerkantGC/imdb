import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  // Change to use cyberToken for consistency
  const token = ref(localStorage.getItem('cyberToken') || null);
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!token.value);
  const welcomeMessage = computed(() => user.value ? `Welcome, ${user.value.firstName}` : '');

  async function login(credentials) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      user.value = response.data.user;
      token.value = response.data.token;
      // Update to store token as cyberToken for consistency
      localStorage.setItem('cyberToken', response.data.token);
      router.push('/');
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed';
    } finally {
      loading.value = false;
    }
  }

  async function register(userData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.register(userData);
      user.value = response.data.user;
      token.value = response.data.token;
      // Update to store token as cyberToken for consistency
      localStorage.setItem('cyberToken', response.data.token);
      router.push('/');
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err; // Re-throw to handle in component
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    // Update to remove cyberToken for consistency
    localStorage.removeItem('cyberToken');
    router.push('/login');
  }

  async function fetchProfile() {
      if (!token.value) return;
      loading.value = true;
      try {
          const response = await authService.getProfile();
          user.value = response.data.user;
      } catch (err) {
          console.error('Failed to fetch profile:', err);
          logout();
      } finally {
          loading.value = false;
      }
  }

  return { user, token, loading, error, isAuthenticated, welcomeMessage, login, register, logout, fetchProfile };
}, {
  persist: {
      paths: ['user'],
  }
});