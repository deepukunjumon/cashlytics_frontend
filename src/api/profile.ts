import { api } from '@/api/axios';
import type { ApiResponse, User } from '@/types';

export interface UpdateProfilePayload {
  name: string;
  mobile?: string;
  currency: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/profile');
  return response.data.data;
}

export async function updateProfile(payload: UpdateProfilePayload | FormData): Promise<User> {
  const response = await api.post<ApiResponse<User>>('/profile', payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data.data;
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await api.put('/profile/password', payload);
}
