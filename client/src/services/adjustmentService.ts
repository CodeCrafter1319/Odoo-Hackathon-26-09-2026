import { apiClient } from './apiClient';

export const adjustmentService = {
  getAdjustments: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/stock-adjustments${qs}`);
  },
  getAdjustmentById: (id: string) => apiClient.get(`/stock-adjustments/${id}`),
  createAdjustment: (data: any) => apiClient.post('/stock-adjustments', data),
  updateAdjustment: (id: string, data: any) => apiClient.put(`/stock-adjustments/${id}`, data),
  deleteAdjustment: (id: string) => apiClient.delete(`/stock-adjustments/${id}`),
  approveAdjustment: (id: string) => apiClient.post(`/stock-adjustments/${id}/approve`),
  completeAdjustment: (id: string) => apiClient.post(`/stock-adjustments/${id}/complete`),
};
