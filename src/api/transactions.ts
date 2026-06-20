import { api } from '@/api/axios';
import type { ApiResponse, PaginatedResponse, Transaction, TransactionType } from '@/types';

export interface StoreTransactionPayload {
  account_id: string;
  transfer_account_id?: string;
  category_id?: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
  tags?: string[];
}

export interface TransactionFilters {
  account_id?: string;
  category_id?: string;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  month?: string;
  page?: number;
  per_page?: number;
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[] | PaginatedResponse<Transaction>> {
  const response = await api.get<ApiResponse<Transaction[] | PaginatedResponse<Transaction>>>('/transactions', { params: filters });
  return response.data.data;
}

export async function createTransaction(payload: StoreTransactionPayload): Promise<Transaction> {
  const response = await api.post<ApiResponse<Transaction>>('/transactions', payload);
  return response.data.data;
}

export async function updateTransaction(id: string, payload: Partial<StoreTransactionPayload>): Promise<Transaction> {
  const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload);
  return response.data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export async function exportTransactionsCsv(filters?: TransactionFilters): Promise<Blob> {
  const response = await api.get('/transactions/export/csv', { params: filters, responseType: 'blob' });
  return response.data;
}
