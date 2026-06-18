import { api } from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface PublicSettings {
  app_version:       string;
  footer_text:       string;
  app_name:          string;
  sso_enabled:       boolean;
  sso_provider_name: string;
}

let cachedSettings: PublicSettings | null = null;

export async function getPublicSettings(): Promise<PublicSettings> {
  if (cachedSettings) return cachedSettings;

  const response = await api.get<ApiResponse<PublicSettings>>('/settings/public');
  cachedSettings = response.data.data as PublicSettings;
  return cachedSettings;
}
