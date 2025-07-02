<template>
  <div>
      <div v-if="movieStore.loading">Loading movie details...</div>
      <div v-if="movieStore.error" class="text-red-500">{{ movieStore.error }}</div>
      <div v-if="movie" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-1">
              <img :src="movie.imageUrl || 'https://via.placeholder.com/500x750'" :alt="movie.title" class="rounded-lg w-full shadow-lg">
          </div>
          <div class="md:col-span-2">
              <h1 class="text-4xl font-bold mb-2">{{ movie.title }} ({{ movie.releaseYear }})</h1>
              <div class="flex items-center space-x-4 mb-4">
                  <span class="text-yellow-400">Rating: {{ movie.averageRating }} / 10 ({{ movie.totalRatings }} ratings)</span>
                  <span>Popularity: #{{ movie.popularityScore.toFixed(2) }}</span>
              </div>
              <p class="text-gray-300 mb-6">{{ movie.summary }}</p>

              <div class="flex space-x-4 mb-6">
                <template v-if="isYouTubeTrailer">
                  <button @click="showTrailer = !showTrailer" class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    {{ showTrailer ? 'Hide Trailer' : 'Watch Trailer' }}
                  </button>
                </template>
                <template v-else>
                  <a :href="movie.trailerUrl" target="_blank" class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Watch Trailer</a>
                </template>
                <button @click="toggleWatchlist" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {{ isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist' }}
                </button>
              </div>
              <div v-if="showTrailer && isYouTubeTrailer" class="mb-6">
                <iframe
                  :src="youtubeEmbedUrl"
                  width="100%"
                  height="400"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="rounded-lg w-full shadow-lg"
                ></iframe>
              </div>

              <!-- Rating and Comment -->
              <div v-if="authStore.isAuthenticated" class="bg-gray-800 p-4 rounded-lg">
                  <h3 class="font-bold text-xl mb-2">Your Rating & Comment</h3>
                  <!-- Rating component would go here -->
                  <textarea v-model="comment" placeholder="Leave a comment..." class="w-full bg-gray-700 p-2 rounded text-white"></textarea>
                  <button @click="submitComment" class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit</button>
              </div>
              <div v-else>
                  <p><router-link to="/login" class="text-blue-400 hover:underline">Login</router-link> to rate or comment.</p>
              </div>
          </div>
           <!-- Ratings Chart -->
          <div class="md:col-span-3 mt-8">
                <h2 class="text-2xl font-bold mb-4">Rating Distribution by Country</h2>
                <RatingChart :chart-data="chartData" />
          </div>
          <!-- Comments Section -->
          <div class="md:col-span-3 mt-8">
              <h2 class="text-2xl font-bold mb-4">Comments</h2>
              <!-- Comments list would go here -->
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovieStore } from '../store/movie';
import { useAuthStore } from '../store/auth';
import { useWatchlistStore } from '../store/watchlist';
import commentService from '../services/commentService';
import RatingChart from '../components/RatingChart.vue';

const route = useRoute();
const router = useRouter();
const movieStore = useMovieStore();
const authStore = useAuthStore();
const watchlistStore = useWatchlistStore();

const comment = ref('');
const movie = computed(() => movieStore.selectedMovie);
const isInWatchlist = computed(() => watchlistStore.items.some(item => item.movie === movie.value?._id));

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Average Rating by Country',
    data: [],
    backgroundColor: '#3B82F6',
  }]
});

const showTrailer = ref(true);
const isYouTubeTrailer = computed(() => {
  if (!movie.value?.trailerUrl) return false;
  return /youtube\.com|youtu\.be/.test(movie.value.trailerUrl);
});
const youtubeEmbedUrl = computed(() => {
  if (!movie.value?.trailerUrl) return '';
  // youtube.com/watch?v= or youtu.be/...
  let videoId = '';
  const url = movie.value.trailerUrl;
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) {
    videoId = youtubeMatch[1];
  } else {
    // Try to extract v param
    const vParam = url.match(/[?&]v=([\w-]+)/);
    if (vParam) videoId = vParam[1];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
});

onMounted(() => {
  movieStore.fetchMovieById(route.params.id);
  if(authStore.isAuthenticated) {
      watchlistStore.fetchWatchlist();
  }
});

watch(movie, (newMovie) => {
    if (newMovie && newMovie.ratingsByCountry) {
        chartData.value = {
            labels: newMovie.ratingsByCountry.map(r => r.country),
            datasets: [{
                label: 'Average Rating',
                data: newMovie.ratingsByCountry.map(r => r.averageRating),
                 backgroundColor: 'rgba(59, 130, 246, 0.5)',
                 borderColor: 'rgba(59, 130, 246, 1)',
                 borderWidth: 1
            }]
        }
    }
})

const toggleWatchlist = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  if (isInWatchlist.value) {
    watchlistStore.removeMovie(movie.value._id);
  } else {
    watchlistStore.addMovie(movie.value._id);
  }
};

const submitComment = async () => {
    if(!comment.value.trim()) return;
    try {
        await commentService.addComment(movie.value._id, comment.value);
        comment.value = '';
        // Here you would refresh comments
    } catch (error) {
        console.error("Failed to add comment", error);
    }
}
</script> 