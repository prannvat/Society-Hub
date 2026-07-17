import { apiRequest } from './client';

export type ApiUniversitySummary = {
  id: string;
  name: string;
  shortName: string;
  domain?: string;
  location?: string;
  logoUrl?: string | null;
  isActive?: boolean;
};

export async function fetchUniversities() {
  return apiRequest<ApiUniversitySummary[]>('/universities');
}
