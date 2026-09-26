import { apiClient } from './apiClient';

export const authService = {
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
};
