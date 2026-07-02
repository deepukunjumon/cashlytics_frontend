import { api } from '@/api/axios';
import type { ApiResponse, PaginatedResponse, RealtimeNotification } from '@/types';

export async function getRealtimeNotifications(): Promise<PaginatedResponse<RealtimeNotification>> {
  const response = await api.get<ApiResponse<PaginatedResponse<RealtimeNotification>>>('/realtime-notifications');
  return response.data.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<ApiResponse<{ count: number }>>('/realtime-notifications/unread-count');
  return response.data.data.count;
}

export async function markOneRead(id: string): Promise<void> {
  await api.post(`/realtime-notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await api.post('/realtime-notifications/read-all');
}

export async function clearAll(): Promise<void> {
  await api.delete('/realtime-notifications');
}
