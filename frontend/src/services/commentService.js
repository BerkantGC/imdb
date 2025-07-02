import apiClient from './api';

export default {
  getCommentsForMovie(movieId) {
    return apiClient.get(`/movies/${movieId}/comments`);
  },
  addComment(movieId, content) {
    return apiClient.post(`/movies/${movieId}/comments`, { content });
  },
}; 