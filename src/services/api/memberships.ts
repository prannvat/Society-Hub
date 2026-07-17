import { apiRequest } from './client';
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

export async function joinMembership(societyId: string) {
  return apiRequest<Membership>('/memberships/join', {
    method: 'POST',
    body: { societyId },
  });
}

export async function leaveMembership(societyId: string) {
  return apiRequest<{ success?: boolean }>(`/memberships/${encodeURIComponent(societyId)}/leave`, {
    method: 'DELETE',
  });
}
