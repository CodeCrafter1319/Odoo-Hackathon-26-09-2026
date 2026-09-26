import { apiClient } from './apiClient';

export const categoryService = {
  getCategories: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/categories${qs}`);
  },
  getCategoryById: (id: string) => apiClient.get(`/categories/${id}`),
  createCategory: (data: any) => apiClient.post('/categories', data),
  updateCategory: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`),
};
