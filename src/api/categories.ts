import { api } from '@/api/axios';
import type { ApiResponse, Category, TransactionType } from '@/types';

export interface StoreCategoryPayload {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  parent_id?: string;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data.data;
}

export async function createCategory(payload: StoreCategoryPayload): Promise<Category> {
  const response = await api.post<ApiResponse<Category>>('/categories', payload);
  return response.data.data;
}

export async function updateCategory(id: string, payload: Partial<StoreCategoryPayload>): Promise<Category> {
  const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return response.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
