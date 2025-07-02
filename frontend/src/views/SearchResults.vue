<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Search Results for "{{ query }}"</h1>
    <div v-if="movieStore.loading">Loading...</div>
    <div v-else-if="movieStore.error" class="text-red-500">{{ movieStore.error }}</div>
    <div v-else-if="movies.length === 0">No movies found.</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="movie in movies" :key="movie._id" @click="goToMovie(movie._id)"
           class="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300">
        <img :src="movie.imageUrl || 'https://via.placeholder.com/500x750'" :alt="movie.title" class="w-full h-96 object-cover">
        <div class="p-4">
          <h3 class="font-bold text-lg">{{ movie.title }}</h3>
          <p class="text-gray-400">Rating: {{ movie.averageRating }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovieStore } from '../store/movie';

const route = useRoute();
const router = useRouter();
const movieStore = useMovieStore();

const query = ref(route.query.q);
const movies = computed(() => movieStore.searchResults);

watchEffect(() => {
  query.value = route.query.q;
  if (query.value) {
    movieStore.search({ q: query.value });
  }
});

const goToMovie = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};
</script> 