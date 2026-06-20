import { api } from '@/api/axios';
import type { ApiResponse, ReportSummary } from '@/types';

export async function getReportSummary(startDate: string, endDate: string): Promise<ReportSummary> {
  const response = await api.get<ApiResponse<ReportSummary>>('/reports/summary', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data.data;
}

export async function downloadReportPdf(startDate: string, endDate: string): Promise<Blob> {
  const response = await api.get('/reports/export/pdf', {
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob',
  });
  return response.data;
}

export async function downloadReportCsv(startDate: string, endDate: string): Promise<Blob> {
  const response = await api.get('/reports/export/csv', {
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob',
  });
  return response.data;
}
