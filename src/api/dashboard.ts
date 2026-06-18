import { api } from '@/api/axios';
import type { ApiResponse, DashboardStats } from '@/types';

export async function getDashboardStats(month?: string): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard', { params: { month } });
  return response.data.data;
}
