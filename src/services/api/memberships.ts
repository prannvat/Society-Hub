import { ApiError, apiRequest } from './client';
import { Membership, SocietyRole } from './types';

export async function fetchMemberships(societyId: string) {
  return apiRequest<Membership[]>(`/memberships?societyId=${encodeURIComponent(societyId)}`);
}

export async function updateMembershipRole(membershipId: string, role: SocietyRole) {
  return apiRequest<Membership>(`/memberships/${membershipId}/role`, {
    method: 'PATCH',
    body: { role },
  });
}

export type MembershipRequest = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
};

/**
 * Joining an approval-required society returns a pending membership request
 * instead of a membership.
 */
export type JoinMembershipResult =
  | Membership
  | { status: 'PENDING'; membershipRequest: MembershipRequest };

export function isPendingJoin(
  result: JoinMembershipResult,
): result is { status: 'PENDING'; membershipRequest: MembershipRequest } {
  return 'status' in result && result.status === 'PENDING' && 'membershipRequest' in result;
}

export async function joinMembership(societyId: string) {
  return apiRequest<JoinMembershipResult>('/memberships/join', {
    method: 'POST',
    body: { societyId },
  });
}

/** Maps join API errors to user-friendly messages. */
export function joinErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'SOCIETY_NOT_APPROVED') {
      return 'This society has not been approved by the union yet, so it cannot accept members.';
    }
    if (error.code === 'STUDENT_VERIFICATION_REQUIRED') {
      return 'You need to verify your student status before joining this society.';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'Unable to join this society right now. Please try again.';
}

export async function leaveMembership(societyId: string) {
  return apiRequest<{ success?: boolean }>(`/memberships/${encodeURIComponent(societyId)}/leave`, {
    method: 'DELETE',
  });
}

// Membership requests (society admin review)

export async function fetchMembershipRequests(societyId: string) {
  return apiRequest<MembershipRequest[]>(`/memberships/requests?societyId=${encodeURIComponent(societyId)}`);
}

export async function approveMembershipRequest(requestId: string) {
  return apiRequest<MembershipRequest>(`/memberships/requests/${requestId}/approve`, {
    method: 'POST',
  });
}

export async function rejectMembershipRequest(requestId: string) {
  return apiRequest<MembershipRequest>(`/memberships/requests/${requestId}/reject`, {
    method: 'POST',
  });
}
