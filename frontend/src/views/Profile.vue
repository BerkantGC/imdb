<template>
  <div class="min-h-screen bg-background text-on-surface">
    <NavigationBar />
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">{{ t('profile.title') }}</h1>
        <p class="text-on-surface-secondary">{{ t('profile.subtitle') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="user" class="max-w-4xl mx-auto">
        <div class="bg-surface border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <!-- Profile Header -->
          <div class="bg-gradient-to-r from-primary to-primary-dark p-6">
            <div class="flex flex-col md:flex-row items-center gap-6">
              <!-- Profile Photo -->
              <div class="relative">
                <div class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="user.profilePhoto" 
                    :src="getProfilePhotoUrl(user.profilePhoto)" 
                    :alt="user.firstName + ' ' + user.lastName"
                    class="w-full h-full object-cover"
                  />
                  <svg v-else class="w-12 h-12 md:w-16 md:h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <button 
                  v-if="isEditing"
                  @click="triggerFileInput"
                  class="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white rounded-full p-2 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept="image/*" 
                  @change="handleFileSelect" 
                  class="hidden"
                />
              </div>

              <!-- User Info -->
              <div class="text-center md:text-left">
                <h2 class="text-2xl md:text-3xl font-bold text-white">
                  {{ user.firstName }} {{ user.lastName }}
                </h2>
                <p class="text-primary-light opacity-90">{{ user.email }}</p>
                <p class="text-white opacity-80 mt-1">
                  {{ user.city }}, {{ user.country }}
                </p>
                <div class="mt-3 flex flex-col md:flex-row gap-2">
                  <span class="text-sm bg-white/20 text-white px-3 py-1 rounded-full">
                    {{ t('profile.member_since') }}: {{ formatDate(user.createdAt) }}
                  </span>
                  <span v-if="user.isAdmin" class="text-sm bg-yellow-500 text-black px-3 py-1 rounded-full font-medium">
                    {{ t('profile.admin') }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="ml-auto flex flex-col gap-2">
                <button
                  v-if="!isEditing"
                  @click="startEditing"
                  class="bg-white text-primary font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {{ t('profile.edit_profile') }}
                </button>
                <template v-else>
                  <button
                    @click="saveChanges"
                    :disabled="saveLoading"
                    class="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {{ saveLoading ? t('profile.saving') : t('profile.save_changes') }}
                  </button>
                  <button
                    @click="cancelEditing"
                    class="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {{ t('profile.cancel') }}
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-4">{{ t('profile.personal_information') }}</h3>
            
            <form v-if="isEditing" @submit.prevent="saveChanges" class="space-y-4">
              <!-- First Name -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('profile.first_name') }}</label>
                <input
                  v-model="editForm.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <!-- Last Name -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('profile.last_name') }}</label>
                <input
                  v-model="editForm.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('profile.email') }}</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <!-- Country -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('profile.country') }}</label>
                <input
                  v-model="editForm.country"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('profile.city') }}</label>
                <input
                  v-model="editForm.city"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>

            <!-- View Mode -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-on-surface-secondary mb-1">{{ t('profile.first_name') }}</label>
                  <p class="text-lg">{{ user.firstName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-on-surface-secondary mb-1">{{ t('profile.last_name') }}</label>
                  <p class="text-lg">{{ user.lastName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-on-surface-secondary mb-1">{{ t('profile.email') }}</label>
                  <p class="text-lg">{{ user.email }}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-on-surface-secondary mb-1">{{ t('profile.country') }}</label>
                  <p class="text-lg">{{ user.country }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-on-surface-secondary mb-1">{{ t('profile.city') }}</label>
                  <p class="text-lg">{{ user.city }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-on-surface-secondary mb-1">{{ t('profile.account_status') }}</label>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ user.isActive ? t('profile.active') : t('profile.inactive') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Section -->
          <div class="border-t border-gray-700 p-6">
            <h3 class="text-xl font-semibold mb-4">{{ t('profile.statistics') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-background rounded-lg">
                <div class="text-2xl font-bold text-primary">{{ stats.watchlistCount || 0 }}</div>
                <div class="text-sm text-on-surface-secondary">{{ t('profile.watchlist_movies') }}</div>
              </div>
              <div class="text-center p-4 bg-background rounded-lg">
                <div class="text-2xl font-bold text-primary">{{ stats.ratingsCount || 0 }}</div>
                <div class="text-sm text-on-surface-secondary">{{ t('profile.ratings_given') }}</div>
              </div>
              <div class="text-center p-4 bg-background rounded-lg">
                <div class="text-2xl font-bold text-primary">{{ stats.commentsCount || 0 }}</div>
                <div class="text-sm text-on-surface-secondary">{{ t('profile.comments_written') }}</div>
              </div>
              <div class="text-center p-4 bg-background rounded-lg">
                <div class="text-2xl font-bold text-primary">{{ stats.averageRating || '0.0' }}</div>
                <div class="text-sm text-on-surface-secondary">{{ t('profile.average_rating') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change Section -->
        <div class="mt-8 bg-surface border border-gray-700 rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-semibold mb-4">{{ t('profile.change_password') }}</h3>
          <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
            <div>
              <label class="block text-sm font-medium mb-2">{{ t('profile.current_password') }}</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{{ t('profile.new_password') }}</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="8"
                class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{{ t('profile.confirm_password') }}</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="8"
                class="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              :disabled="passwordLoading"
              class="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ passwordLoading ? t('profile.updating') : t('profile.update_password') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../store/auth';
import authService from '../services/authService';
import apiClient from '../services/api';
import NavigationBar from '../components/NavigationBar.vue';

const { t } = useI18n();
const authStore = useAuthStore();

// Reactive data
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const saveLoading = ref(false);
const passwordLoading = ref(false);
const fileInput = ref(null);

const user = ref(null);
const stats = ref({
  watchlistCount: 0,
  ratingsCount: 0,
  commentsCount: 0,
  averageRating: '0.0'
});

const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  city: '',
  profilePhoto: null
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Computed
const getProfilePhotoUrl = computed(() => {
  return (photoPath) => {
    if (!photoPath) return null;
    return photoPath.startsWith('http') ? photoPath : `http://localhost:3000/${photoPath}`;
  };
});

// Methods
const loadProfile = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await authService.getProfile();
    user.value = response.data.user;
    
    // Update auth store
    authStore.user = response.data.user;
    
    // Load user statistics
    await loadUserStats();
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

const loadUserStats = async () => {
  try {
    const [watchlistRes, ratingsRes, commentsRes] = await Promise.all([
      apiClient.get('/watchlist'),
      apiClient.get('/ratings/mine'),
      apiClient.get('/comments/mine')
    ]);
    
    stats.value.watchlistCount = watchlistRes.data.watchlist?.movies?.length || 0;
    stats.value.ratingsCount = ratingsRes.data.ratings?.length || 0;
    stats.value.commentsCount = commentsRes.data.comments?.length || 0;
    
    // Calculate average rating
    if (ratingsRes.data.ratings?.length > 0) {
      const sum = ratingsRes.data.ratings.reduce((acc, rating) => acc + rating.rating, 0);
      stats.value.averageRating = (sum / ratingsRes.data.ratings.length).toFixed(1);
    }
  } catch (err) {
    console.error('Failed to load user statistics:', err);
  }
};

const startEditing = () => {
  isEditing.value = true;
  editForm.firstName = user.value.firstName;
  editForm.lastName = user.value.lastName;
  editForm.email = user.value.email;
  editForm.country = user.value.country;
  editForm.city = user.value.city;
};

const cancelEditing = () => {
  isEditing.value = false;
  editForm.profilePhoto = null;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    editForm.profilePhoto = file;
  }
};

const saveChanges = async () => {
  try {
    saveLoading.value = true;
    error.value = null;
    
    const formData = new FormData();
    formData.append('firstName', editForm.firstName);
    formData.append('lastName', editForm.lastName);
    formData.append('email', editForm.email);
    formData.append('country', editForm.country);
    formData.append('city', editForm.city);
    
    if (editForm.profilePhoto) {
      formData.append('profilePhoto', editForm.profilePhoto);
    }
    
    const response = await apiClient.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    user.value = response.data.user;
    authStore.user = response.data.user;
    isEditing.value = false;
    editForm.profilePhoto = null;
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile';
  } finally {
    saveLoading.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }
  
  try {
    passwordLoading.value = true;
    error.value = null;
    
    await apiClient.put('/auth/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    
    // Reset form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    // Show success message (you might want to add a success state)
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update password';
  } finally {
    passwordLoading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  loadProfile();
});
</script>