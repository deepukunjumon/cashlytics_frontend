import { api } from '@/api/axios';
import type { ApiResponse, Budget, BudgetPeriod } from '@/types';

export interface StoreBudgetPayload {
  category_id: string;
  period: BudgetPeriod;
  amount: number;
  year: number;
  month?: number;
}

export async function getBudgets(year?: number, month?: number): Promise<Budget[]> {
  const response = await api.get<ApiResponse<Budget[]>>('/budgets', { params: { year, month } });
  return response.data.data;
}

export async function createBudget(payload: StoreBudgetPayload): Promise<Budget> {
  const response = await api.post<ApiResponse<Budget>>('/budgets', payload);
  return response.data.data;
}

export async function updateBudget(id: string, amount: number): Promise<Budget> {
  const response = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, { amount });
  return response.data.data;
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
