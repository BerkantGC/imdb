<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-white">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" v-model="email" id="email" required
                 class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input type="password" v-model="password" id="password" required
                 class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div v-if="authStore.error" class="text-red-500 text-sm">
          {{ authStore.error }}
        </div>
        <div>
          <button type="submit" :disabled="authStore.loading"
                  class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            <span v-if="authStore.loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </div>
      </form>
      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 text-gray-400 bg-gray-800">Or continue with</span>
        </div>
      </div>
       <p class="text-sm text-center text-gray-400">
        Don't have an account? 
        <router-link to="/register" class="font-medium text-blue-400 hover:underline">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();

const handleLogin = () => {
  authStore.login({ email: email.value, password: password.value });
};

const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:3000/api/auth/google';
};
</script> 