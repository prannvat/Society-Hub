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

/** Maps auth API errors to user-friendly messages for inline display. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return 'Incorrect email or password. Please try again.';
    }
    if (error.code === 'EMAIL_TAKEN') {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'Something went wrong. Please check your connection and try again.';
}
