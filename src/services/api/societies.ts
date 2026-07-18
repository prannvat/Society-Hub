import { apiRequest } from './client';
import { PublicSocietyMemberPage, Society } from './types';

export async function fetchSocieties() {
  return apiRequest<Society[]>('/societies');
}

export async function fetchSocietyProfile(societyId: string) {
  return apiRequest<Society>(`/societies/${societyId}`);
}

/**
 * A society's public member list — its members are its followers, so any
 * signed-in user may read it. Ordered president → committee → members.
 */
export async function fetchSocietyMembers(societyId: string, page = 1, pageSize = 30) {
  const query = `?page=${page}&pageSize=${pageSize}`;
  return apiRequest<PublicSocietyMemberPage>(
    `/societies/${encodeURIComponent(societyId)}/members${query}`,
  );
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
