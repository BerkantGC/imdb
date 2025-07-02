import apiClient from './api';

export default {
  register(userData) {
    return apiClient.post('/auth/register', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  logout() {
    // In a real app, you might want to call a backend endpoint to invalidate the token
    return Promise.resolve();
  },
  getProfile() {
    return apiClient.get('/auth/profile');
  },
}; 