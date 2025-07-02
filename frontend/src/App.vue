<script setup>
import { onMounted } from 'vue';
import NavigationBar from './components/NavigationBar.vue'
import { useAuthStore } from './store/auth';

const authStore = useAuthStore();

onMounted(() => {
  // Check if token exists and load user profile from both stores
  if (localStorage.getItem('cyberToken')) {
    authStore.fetchProfile();
  }
});
</script>

<template>
  <div id="cyberplex-app" class="bg-gradient-cyber min-h-screen text-platinum font-modern">
    <div class="cosmic-particles absolute inset-0 pointer-events-none"></div>
    <NavigationBar />
    <main class="cosmic-container mx-auto p-6 relative z-10">
      <router-view />
    </main>
    <div class="cyber-footer fixed bottom-0 left-0 right-0 h-1 bg-gradient-neon"></div>
  </div>
</template>

<style scoped>
.cosmic-particles {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #66FCF1, transparent),
    radial-gradient(2px 2px at 40px 70px, #DC143C, transparent),
    radial-gradient(1px 1px at 90px 40px, #663399, transparent),
    radial-gradient(1px 1px at 130px 80px, #66FCF1, transparent),
    radial-gradient(2px 2px at 160px 30px, #DC143C, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: float 20s linear infinite;
  opacity: 0.1;
}

@keyframes cosmic-drift {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-10px, -10px); }
  50% { transform: translate(10px, -20px); }
  75% { transform: translate(-5px, -15px); }
  100% { transform: translate(0, 0); }
}

.cosmic-container {
  max-width: 1400px;
}

.cyber-neon-text {
  text-shadow: 0 0 10px rgba(102, 252, 241, 0.8);
}

.cyber-hover-effect {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cyber-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}
</style>
