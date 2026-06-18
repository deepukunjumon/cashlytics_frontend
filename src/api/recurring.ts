import { api } from '@/api/axios';
import type { ApiResponse, RecurringTransaction, RecurringFreq, TransactionType } from '@/types';

export interface StoreRecurringPayload {
  account_id:  string;
  category_id?: string;
  type:        TransactionType;
  amount:      number;
  note?:       string;
  frequency:   RecurringFreq;
  starts_at:   string;
  ends_at?:    string;
}

export async function getRecurring(): Promise<RecurringTransaction[]> {
  const response = await api.get<ApiResponse<RecurringTransaction[]>>('/recurring');
  return response.data.data;
}

export async function storeRecurring(payload: StoreRecurringPayload): Promise<RecurringTransaction> {
  const response = await api.post<ApiResponse<RecurringTransaction>>('/recurring', payload);
  return response.data.data;
}

export async function deleteRecurring(id: string): Promise<void> {
  await api.delete(`/recurring/${id}`);
}
