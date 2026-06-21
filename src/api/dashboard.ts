import { api } from '@/api/axios';
import type { ApiResponse, DashboardStats } from '@/types';

export async function getDashboardStats(month?: string, sections?: string[]): Promise<DashboardStats> {
  const params: Record<string, string | undefined> = { month };
  if (sections?.length) params.sections = sections.join(',');
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard', { params });
  return response.data.data;
}
