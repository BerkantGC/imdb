import { defineStore } from 'pinia';
import { ref } from 'vue';
import movieService from '../services/movieService';

export const useMovieStore = defineStore('movie', () => {
  const movies = ref([]);
  const selectedMovie = ref(null);
  const searchResults = ref([]);
  const autocompleteResults = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchTopMovies() {
    loading.value = true;
    error.value = null;
    try {
      const response = await movieService.getTopMovies();
      movies.value = response.data.movies;
    } catch (err) {
      error.value = 'Failed to fetch top movies';
    } finally {
      loading.value = false;
    }
  }

  async function fetchMovieById(id) {
    loading.value = true;
    error.value = null;
    selectedMovie.value = null;
    try {
      const response = await movieService.getMovieById(id);
      selectedMovie.value = response.data.movie;
    } catch (err) {
      error.value = 'Failed to fetch movie details';
    } finally {
      loading.value = false;
    }
  }

  async function search(params) {
    loading.value = true;
    error.value = null;
    searchResults.value = [];
    try {
      const response = await movieService.searchMovies(params);
      searchResults.value = response.data.movies;
    } catch (err) {
      error.value = 'Search failed';
    } finally {
      loading.value = false;
    }
  }

  async function autocomplete(query) {
    if (query.length < 3) {
      autocompleteResults.value = [];
      return;
    }
    try {
      const response = await movieService.autocompleteSearch(query);
      autocompleteResults.value = response.data.suggestions;
    } catch (err) {
      // Don't show an error for autocomplete
      console.error('Autocomplete failed', err);
    }
  }

  return { 
    movies, 
    selectedMovie, 
    searchResults,
    autocompleteResults,
    loading, 
    error, 
    fetchTopMovies, 
    fetchMovieById, 
    search,
    autocomplete
  };
}, {
    persist: true
}); 