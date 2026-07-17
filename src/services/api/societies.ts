import { apiRequest } from './client';
import { Society } from './types';

export async function fetchSocieties() {
  return apiRequest<Society[]>('/societies');
}

export async function fetchSocietyProfile(societyId: string) {
  return apiRequest<Society>(`/societies/${societyId}`);
}

export async function createSociety(input: {
  name: string;
  shortName: string;
  university?: string;
  joinPolicy?: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';
  description: string;
}) {
  // The API rejects unknown fields and empty strings — only send populated ones.
  const body: Record<string, string> = {
    name: input.name,
    shortName: input.shortName,
    description: input.description,
  };
  if (input.university) body.university = input.university;
  if (input.joinPolicy) body.joinPolicy = input.joinPolicy;
  return apiRequest<Society>('/societies', {
    method: 'POST',
    body,
  });
}

export type UpdateSocietyInput = Partial<
  Omit<Society, 'id' | 'createdAt' | 'updatedAt' | '_count'>
>;

export async function updateSocietyProfile(societyId: string, input: UpdateSocietyInput) {
  return apiRequest<Society>(`/societies/${societyId}`, {
    method: 'PATCH',
    body: input,
  });
}
