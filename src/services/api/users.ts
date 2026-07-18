import { ApiError, apiRequest } from './client';
import { SocietyRole } from './types';

/** Platforms the backend accepts on a profile link. `other` requires a label. */
export const LINK_PLATFORMS = [
  'instagram',
  'snapchat',
  'tiktok',
  'x',
  'linkedin',
  'github',
  'youtube',
  'spotify',
  'website',
  'other',
] as const;

export type LinkPlatform = (typeof LINK_PLATFORMS)[number];

export type UserLink = {
  id: string;
  platform: LinkPlatform;
  label: string | null;
  url: string;
};

/** A link as submitted to `PUT /me/links` — no id, the server mints those. */
export type UserLinkInput = {
  platform: LinkPlatform;
  label?: string | null;
  url: string;
};

/** A society on someone's public profile — carries its own brand colours. */
export type ProfileSociety = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  role: SocietyRole;
  joinedAt: string;
};

/**
 * Any user as seen by any other signed-in user. Deliberately excludes email —
 * the backend never sends it on this route and nothing in the app should expect it.
 */
export type PublicUserProfile = {
  id: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  course: string | null;
  year: string | null;
  isVerifiedStudent: boolean;
  createdAt: string;
  links: UserLink[];
  societies: ProfileSociety[];
};

export type UsernameAvailability = {
  available: boolean;
  normalized: string;
};

/** Max links the backend will store per user. */
export const MAX_USER_LINKS = 6;
/** Max length of the custom label required by the `other` platform. */
export const MAX_LINK_LABEL_LENGTH = 24;
export const MAX_LINK_URL_LENGTH = 200;

export async function fetchUserProfile(userId: string) {
  return apiRequest<PublicUserProfile>(`/users/${encodeURIComponent(userId)}`);
}

export async function fetchUserByUsername(username: string) {
  return apiRequest<PublicUserProfile>(`/users/by-username/${encodeURIComponent(username)}`);
}

export async function checkUsernameAvailable(username: string) {
  return apiRequest<UsernameAvailability>(
    `/users/username-available?username=${encodeURIComponent(username)}`,
  );
}

/** Replaces the caller's entire link set. Array order is preserved as display order. */
export async function updateMyLinks(links: UserLinkInput[]) {
  return apiRequest<UserLink[]>('/me/links', {
    method: 'PUT',
    body: { links },
  });
}

/** True when a profile lookup failed because no such user exists. */
export function isUserNotFound(error: unknown): boolean {
  return error instanceof ApiError && (error.code === 'USER_NOT_FOUND' || error.statusCode === 404);
}

const GENERIC_PROFILE_ERROR = 'Something went wrong on our end. Please try again.';
const NETWORK_ERROR = "Can't reach SocietyHub — check your connection.";

/**
 * Maps a profile/username/link failure to curated copy. Never surfaces raw
 * server text — every path resolves to something a student can act on.
 */
export function profileErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error && /network|fetch/i.test(error.message)) {
      return NETWORK_ERROR;
    }
    return GENERIC_PROFILE_ERROR;
  }

  switch (error.code) {
    case 'USERNAME_TAKEN':
      return 'That username is already taken. Try another one.';
    case 'USER_NOT_FOUND':
      return "We couldn't find that profile.";
    case 'VALIDATION_FAILED':
      return 'Some details need fixing before we can save.';
    default:
      break;
  }

  if (error.statusCode === 409) {
    return 'That username is already taken. Try another one.';
  }
  if (error.statusCode === 404) {
    return "We couldn't find that profile.";
  }
  if (error.statusCode === 400) {
    return 'Some details need fixing before we can save.';
  }
  if (/network|fetch/i.test(error.message)) {
    return NETWORK_ERROR;
  }
  return GENERIC_PROFILE_ERROR;
}

/**
 * Client-side mirror of the backend's handle rules, so the field can explain
 * *why* a handle is invalid before we ever spend a round trip on it.
 * Returns null when valid.
 */
export function validateUsername(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (value.length === 0) {
    return null; // empty = "no handle", which is allowed
  }
  if (value.length < 3) {
    return 'Usernames need at least 3 characters.';
  }
  if (value.length > 20) {
    return 'Usernames can be at most 20 characters.';
  }
  if (!/^[a-z]/.test(value)) {
    return 'Usernames must start with a letter.';
  }
  if (!/^[a-z][a-z0-9._]*$/.test(value)) {
    return 'Only letters, numbers, dots and underscores.';
  }
  if (value.includes('..')) {
    return "Usernames can't contain two dots in a row.";
  }
  if (value.endsWith('.')) {
    return "Usernames can't end with a dot.";
  }
  return null;
}

/** Returns null when the URL is acceptable, otherwise the reason it isn't. */
export function validateLinkUrl(raw: string): string | null {
  const value = raw.trim();
  if (value.length === 0) {
    return 'Add a link URL.';
  }
  if (!/^https:\/\//i.test(value)) {
    return 'Links must start with https://';
  }
  if (value.length > MAX_LINK_URL_LENGTH) {
    return `Links can be at most ${MAX_LINK_URL_LENGTH} characters.`;
  }
  return null;
}
