import { apiClient } from './apiClient';

export const receiptService = {
  getReceipts: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/receipts${qs}`);
  },
  getReceiptById: (id: string) => apiClient.get(`/receipts/${id}`),
  createReceipt: (data: any) => apiClient.post('/receipts', data),
  updateReceipt: (id: string, data: any) => apiClient.put(`/receipts/${id}`, data),
  deleteReceipt: (id: string) => apiClient.delete(`/receipts/${id}`),
  validateReceipt: (id: string) => apiClient.post(`/receipts/${id}/validate`),
};
