import { api } from '@/api/axios';
import type { ApiResponse, AuthPayload, LoginPayload, RegisterPayload } from '@/types';

export async function register(payload: RegisterPayload): Promise<AuthPayload> {
  const response = await api.post<ApiResponse<AuthPayload>>('/auth/register', payload);

  return response.data.data;
}

export async function login(payload: LoginPayload): Promise<AuthPayload> {
  const response = await api.post<ApiResponse<AuthPayload>>('/auth/login', payload);

  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
