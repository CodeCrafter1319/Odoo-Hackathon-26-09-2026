import { apiClient } from './apiClient';

export const locationService = {
  getLocations: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/locations${qs}`);
  },
  getLocationById: (id: string) => apiClient.get(`/locations/${id}`),
  createLocation: (data: any) => apiClient.post('/locations', data),
  updateLocation: (id: string, data: any) => apiClient.put(`/locations/${id}`, data),
  deleteLocation: (id: string) => apiClient.delete(`/locations/${id}`),
};
