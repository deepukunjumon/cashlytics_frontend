import { api } from '@/api/axios';
import type { ApiResponse, Notification, PaginatedResponse } from '@/types';

export async function getNotifications(): Promise<PaginatedResponse<Notification>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications');
  return response.data.data;
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/mark-read');
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
