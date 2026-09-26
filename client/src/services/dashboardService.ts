import { apiClient } from './apiClient';

export const dashboardService = {
  getSummary: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/dashboard/summary${qs}`);
  }
};
