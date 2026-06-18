import { api } from '@/api/axios';
import type { ApiResponse, AuditLog, PaginatedResponse } from '@/types';

export interface AuditLogFilters {
  user_id?:    string;
  action?:     string;
  start_date?: string;
  end_date?:   string;
}

export async function getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
  const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/superadmin/audit-logs', { params: filters });
  return response.data.data;
}

export async function getAppSettings(): Promise<Record<string, Record<string, { value: string; type: string; is_public: boolean }>>> {
  const response = await api.get<ApiResponse<Record<string, unknown>>>('/superadmin/app-settings');
  return response.data.data as any;
}

export async function updateAppSettings(settings: { key: string; value: string }[]): Promise<void> {
  await api.put('/superadmin/app-settings', { settings });
}
