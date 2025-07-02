<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900">
    <div class="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-white">Register</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-300">First Name</label>
              <input type="text" v-model="formData.firstName" id="firstName" required class="w-full input-style">
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-300">Last Name</label>
              <input type="text" v-model="formData.lastName" id="lastName" required class="w-full input-style">
            </div>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" v-model="formData.email" id="email" required class="w-full input-style">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input type="password" v-model="formData.password" id="password" required class="w-full input-style" @input="validatePassword">
          <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="country" class="block text-sm font-medium text-gray-300">Country</label>
              <input type="text" v-model="formData.country" id="country" required class="w-full input-style">
            </div>
            <div>
              <label for="city" class="block text-sm font-medium text-gray-300">City</label>
              <input type="text" v-model="formData.city" id="city" required class="w-full input-style">
            </div>
        </div>
        <div>
            <label for="profilePhoto" class="block text-sm font-medium text-gray-300">Profile Photo (Optional)</label>
            <input type="file" @change="onFileChange" id="profilePhoto" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
        </div>
        
        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>
        <div v-if="authStore.error" class="text-red-500 text-sm">
          {{ authStore.error }}
        </div>

        <div>
          <button type="submit" :disabled="authStore.loading || !!passwordError"
                  class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            <span v-if="authStore.loading">Registering...</span>
            <span v-else>Register</span>
          </button>
        </div>
         <p class="text-sm text-center text-gray-400">
            Already have an account? 
            <router-link to="/login" class="font-medium text-blue-400 hover:underline">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

const formData = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  country: '',
  city: '',
  profilePhoto: null,
});

const passwordError = ref('');
const authStore = useAuthStore();
const router = useRouter();
const error = ref('');

const onFileChange = (e) => {
  formData.profilePhoto = e.target.files[0];
};

const validatePassword = () => {
    const pass = formData.password;
    if (pass.length < 8) {
        passwordError.value = 'Password must be at least 8 characters long.';
    } else if (!/[0-9]/.test(pass)) {
        passwordError.value = 'Password must include at least one number.';
    } else if (!/[!@#$%^&*]/.test(pass)) {
        passwordError.value = 'Password must include at least one special character.';
    } else {
        passwordError.value = '';
    }
};

const handleRegister = async () => {
  validatePassword();
  if (passwordError.value) return;

  const data = new FormData();
  for (const key in formData) {
    if (formData[key] !== null && formData[key] !== undefined) {
      data.append(key, formData[key]);
    }
  }
  
  console.log('Registering with data:', Object.fromEntries(data.entries()));

  try {
    // Try with regular auth first
    await authStore.register(data);
    
    // Then try with cyber auth (without file upload)
    try {
      const cyberRegData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        city: formData.city,
      };
      
      await userAuthStore.initializeProfile(cyberRegData);
    } catch (cyberErr) {
      console.error('Cyber registration failed (this is ok if regular auth succeeded):', cyberErr);
    }
    
    router.push('/');
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.message || 'Registration failed';
    // Error is already set in the store
  }
};
</script>

<style scoped>
.input-style {
  @apply w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>