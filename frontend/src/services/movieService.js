import apiClient from './api';

export default {
  getAllMovies(params) {
    return apiClient.get('/movies', { params });
  },
  getMovieById(id) {
    return apiClient.get(`/movies/${id}`);
  },
  searchMovies(params) {
    return apiClient.get('/movies/search', { params });
  },
  autocompleteSearch(query) {
    return apiClient.get(`/movies/autocomplete?q=${query}`);
  },
  getTopMovies(limit = 10) {
    return apiClient.get(`/movies/top?limit=${limit}`);
  },
}; 