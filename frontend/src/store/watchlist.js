import { defineStore } from 'pinia';
import { ref } from 'vue';
import watchlistService from '../services/watchlistService';
import { useAuthStore } from './auth';

export const useWatchlistStore = defineStore('watchlist', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchWatchlist() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      items.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await watchlistService.getWatchlist();
      items.value = response.data.watchlist;
    } catch (err) {
      error.value = 'Failed to fetch watchlist';
    } finally {
      loading.value = false;
    }
  }

  async function addMovie(movieId) {
    loading.value = true;
    error.value = null;
    try {
      const response = await watchlistService.addToWatchlist(movieId);
      items.value.push(response.data.watchlistEntry);
    } catch (err) {
      error.value = 'Failed to add movie to watchlist';
    } finally {
      loading.value = false;
    }
  }

  async function removeMovie(movieId) {
    loading.value = true;
    error.value = null;
    try {
      await watchlistService.removeFromWatchlist(movieId);
      items.value = items.value.filter(item => item.movie !== movieId);
    } catch (err) {
      error.value = 'Failed to remove movie from watchlist';
    } finally {
      loading.value = false;
    }
  }
  
  function clearWatchlist() {
      items.value = [];
  }

  return { items, loading, error, fetchWatchlist, addMovie, removeMovie, clearWatchlist };
}); 