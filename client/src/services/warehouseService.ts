import { apiClient } from './apiClient';

export const warehouseService = {
  getWarehouses: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/warehouses${qs}`);
  },
  getWarehouseById: (id: string) => apiClient.get(`/warehouses/${id}`),
  createWarehouse: (data: any) => apiClient.post('/warehouses', data),
  updateWarehouse: (id: string, data: any) => apiClient.put(`/warehouses/${id}`, data),
  deleteWarehouse: (id: string) => apiClient.delete(`/warehouses/${id}`),
};
