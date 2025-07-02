<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">My Watchlist</h1>
    <div v-if="watchlistStore.loading">Loading watchlist...</div>
    <div v-else-if="watchlistStore.error" class="text-red-500">{{ watchlistStore.error }}</div>
    <div v-else-if="items.length === 0">Your watchlist is empty.</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="item in items" :key="item._id" 
           class="bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
        <img :src="item.movieDetails.imageUrl || 'https://via.placeholder.com/500x750'" :alt="item.movieDetails.title" 
             class="w-full h-96 object-cover cursor-pointer" @click="goToMovie(item.movieDetails._id)">
        <div class="p-4">
          <h3 class="font-bold text-lg">{{ item.movieDetails.title }}</h3>
          <p class="text-gray-400">Rating: {{ item.movieDetails.averageRating }}</p>
        </div>
        <button @click="removeFromWatchlist(item.movie)" 
                class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useWatchlistStore } from '../store/watchlist';
import { useRouter } from 'vue-router';

const watchlistStore = useWatchlistStore();
const router = useRouter();

const items = computed(() => watchlistStore.items);

onMounted(() => {
  watchlistStore.fetchWatchlist();
});

const removeFromWatchlist = (movieId) => {
  watchlistStore.removeMovie(movieId);
};

const goToMovie = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};
</script> 