import { apiRequest } from './client';
import { SocietyRole } from './types';

export type ApiMeProfile = {
  id: string;
  email: string;
  fullName: string;
  university?: string | null;
  universityId?: string | null;
  course?: string | null;
  year?: string | null;
  bio?: string | null;
  instagramLink?: string | null;
  linkedinLink?: string | null;
  avatarUrl?: string | null;
  isVerifiedStudent?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiUserAdminRole = {
  societyId: string;
  societyName: string;
  role: SocietyRole;
};

// Note: /me also returns `unionAdminRoles` — union administration lives in the
// separate web portal, so the mobile app deliberately ignores that field.
export type ApiMeWithRoles = ApiMeProfile & {
  adminRoles?: ApiUserAdminRole[];
};

export async function fetchMe() {
  return apiRequest<ApiMeProfile>('/me');
}

export async function fetchMeWithRoles() {
  return apiRequest<ApiMeWithRoles>('/me?include=adminRoles');
}

export type UpdateMeInput = Partial<
  Omit<ApiMeProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>
>;

export async function updateMe(input: UpdateMeInput) {
  return apiRequest<ApiMeProfile>('/me', {
    method: 'PATCH',
    body: input,
  });
}
