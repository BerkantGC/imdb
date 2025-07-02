<template>
  <div class="flex justify-center items-center h-screen">
    <div class="text-center">
      <p class="text-lg">Logging you in...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;

  if (token) {
    // Set the token in the store
    authStore.token = token;
    
    // Fetch user profile with the new token
    try {
      await authStore.fetchProfile();
      // Redirect to home page after successful login
      router.push('/');
    } catch (error) {
      authStore.logout(); // Clear any partial login state
      router.push('/login?error=profile_fetch_failed');
    }
  } else {
    // No token found, redirect to login
    router.push('/login?error=no_token_provided');
  }
});
</script> 