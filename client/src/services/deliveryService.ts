import { apiClient } from './apiClient';

export const deliveryService = {
  getDeliveries: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/delivery-orders${qs}`);
  },
  getDeliveryById: (id: string) => apiClient.get(`/delivery-orders/${id}`),
  createDelivery: (data: any) => apiClient.post('/delivery-orders', data),
  updateDelivery: (id: string, data: any) => apiClient.put(`/delivery-orders/${id}`, data),
  deleteDelivery: (id: string) => apiClient.delete(`/delivery-orders/${id}`),
  pickDelivery: (id: string) => apiClient.post(`/delivery-orders/${id}/pick`),
  packDelivery: (id: string) => apiClient.post(`/delivery-orders/${id}/pack`),
  validateDelivery: (id: string) => apiClient.post(`/delivery-orders/${id}/validate`),
};
