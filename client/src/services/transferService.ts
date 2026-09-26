import { apiClient } from './apiClient';

export const transferService = {
  getTransfers: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/internal-transfers${qs}`);
  },
  getTransferById: (id: string) => apiClient.get(`/internal-transfers/${id}`),
  createTransfer: (data: any) => apiClient.post('/internal-transfers', data),
  updateTransfer: (id: string, data: any) => apiClient.put(`/internal-transfers/${id}`, data),
  deleteTransfer: (id: string) => apiClient.delete(`/internal-transfers/${id}`),
  scheduleTransfer: (id: string) => apiClient.post(`/internal-transfers/${id}/schedule`),
  startTransfer: (id: string) => apiClient.post(`/internal-transfers/${id}/start`),
  completeTransfer: (id: string) => apiClient.post(`/internal-transfers/${id}/complete`),
};
