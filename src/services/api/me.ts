import { apiRequest } from './client';
import { SocietyRole } from './types';
import { UnionRole } from '../types/union-admin';

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

export type ApiUnionAdminRole = {
  universityId: string;
  universityName: string;
  role: UnionRole;
  permissions: string[];
};

export type ApiMeWithRoles = ApiMeProfile & {
  adminRoles?: ApiUserAdminRole[];
  unionAdminRoles?: ApiUnionAdminRole[];
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
