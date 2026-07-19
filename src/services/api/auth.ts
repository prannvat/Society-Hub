import { ApiError, apiRequest } from './client';
import { ApiMeProfile } from './me';

export type AuthResponse = {
  accessToken: string;
  user: ApiMeProfile;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  universityId?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export async function signUpRequest(input: SignUpInput) {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: input,
  });
}

export async function loginRequest(input: SignInInput) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

const GENERIC_ERROR_MESSAGE = 'Something went wrong on our end. Please try again.';
const NETWORK_ERROR_MESSAGE = "Can't reach SocietyHub — check your connection.";

/**
 * Maps auth API errors to user-friendly messages for inline display.
 * Never surfaces raw API/server text — every path resolves to curated copy.
 */
export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return 'Incorrect email or password. Please try again.';
    }
    if (error.code === 'EMAIL_TAKEN') {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (error.code?.startsWith('VALIDATION')) {
      return "Some of those details don't look right. Please double-check and try again.";
    }
    if (error.code === 'REQUEST_TIMEOUT') {
      return NETWORK_ERROR_MESSAGE;
    }
    // Rate limiting: without this, someone locked out after a few wrong
    // passwords got a generic "something went wrong" and kept retrying, which
    // kept the window open and never recovered.
    if (error.statusCode === 429) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    // Any other API error (404/500/RESOURCE_NOT_FOUND, unparsable bodies, …)
    return GENERIC_ERROR_MESSAGE;
  }
  if (
    error instanceof Error &&
    /network request failed|failed to fetch|network error|internet|timed? ?out/i.test(error.message)
  ) {
    return NETWORK_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}
