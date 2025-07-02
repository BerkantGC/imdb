<template>
  <div class="space-y-12">
    <div class="text-center pt-8">
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{{ t('home.title') }}</h1>
      <p class="text-lg text-on-surface-secondary max-w-2xl mx-auto">
        {{ t('home.description') }}
      </p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-2xl mx-auto">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          @input="onSearchInput"
          @keyup.enter="performSearch"
          :placeholder="t('home.search_placeholder')"
          class="w-full py-3 pl-12 pr-4 text-on-surface bg-surface border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <ul
        v-if="autocompleteResults.length"
        class="absolute z-10 w-full mt-1 bg-surface border border-gray-700 rounded-md shadow-lg"
      >
        <li
          v-for="movie in autocompleteResults"
          :key="movie.id"
          @click="selectAutocomplete(movie)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-700"
        >
          {{ movie.title }}
        </li>
      </ul>
    </div>

    <!-- Top Movies Carousel -->
    <div>
      <h2 class="text-3xl font-bold mb-6">{{ t('home.top_movies') }}</h2>
      <div v-if="movieStore.loading" class="text-center text-on-surface-secondary">{{ t('home.loading') }}</div>
      <div v-if="movieStore.error" class="text-center text-red-500">{{ movieStore.error }}</div>
      <div v-if="!movieStore.loading && movies.length" class="relative">
        <div class="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div v-for="movie in movies" :key="movie._id" class="w-64 flex-shrink-0">
            <div
              @click="goToMovie(movie._id)"
              class="bg-surface rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
            >
              <img
                :src="movie.imageUrl || 'https://via.placeholder.com/500x750'"
                :alt="movie.title"
                class="w-full h-96 object-cover"
              />
              <div class="p-4">
                <h3 class="font-bold text-lg truncate">{{ movie.title }}</h3>
                <p class="text-on-surface-secondary text-sm">
                  {{ t('home.rating') }}: {{ movie.averageRating.toFixed(1) }} / 10
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMovieStore } from '../store/movie';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const movieStore = useMovieStore();
const router = useRouter();
const { t } = useI18n();

const searchQuery = ref('');

const movies = computed(() => movieStore.movies);
const autocompleteResults = computed(() => movieStore.autocompleteResults);

onMounted(() => {
  movieStore.fetchTopMovies();
});

const onSearchInput = () => {
  movieStore.autocomplete(searchQuery.value);
};

const performSearch = () => {
  if (!searchQuery.value.trim()) return;
  router.push({ name: 'SearchResults', query: { q: searchQuery.value } });
};

const selectAutocomplete = (movie) => {
  router.push({ name: 'MovieDetail', params: { id: movie.id } });
};

const goToMovie = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};
</script>
