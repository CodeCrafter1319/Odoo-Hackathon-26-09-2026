import { apiClient } from './apiClient';

export const ledgerService = {
  getLedgerEntries: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/stock-ledger${qs}`);
  },
  getLedgerEntryById: (id: string) => apiClient.get(`/stock-ledger/${id}`),
};
