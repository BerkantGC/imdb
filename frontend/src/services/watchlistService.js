import apiClient from './api';

export default {
  getWatchlist() {
    return apiClient.get('/watchlist');
  },
  addToWatchlist(movieId) {
    return apiClient.post(`/watchlist/${movieId}`);
  },
  removeFromWatchlist(movieId) {
    return apiClient.delete(`/watchlist/${movieId}`);
  },
}; 