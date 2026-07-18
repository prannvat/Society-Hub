import { apiRequest } from './client';
import { SocietyRole } from './types';
import { UserLink } from './users';

export type ApiMeProfile = {
  id: string;
  email: string;
  /** The user's @handle. Null until they pick one. */
  username?: string | null;
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
  /** Ordered profile links, same shape as the public profile route. */
  links?: UserLink[];
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

// `links` is excluded deliberately: PATCH /me does not accept it. Links are
// replaced as a whole set via PUT /me/links (see updateMyLinks).
export type UpdateMeInput = Partial<
  Omit<ApiMeProfile, 'id' | 'email' | 'createdAt' | 'updatedAt' | 'links'>
>;

export async function updateMe(input: UpdateMeInput) {
  return apiRequest<ApiMeProfile>('/me', {
    method: 'PATCH',
    body: input,
  });
}
