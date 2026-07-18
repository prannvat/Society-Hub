import { apiRequest } from './client';
import { CommitteeRequest, CreateCommitteeRequestInput } from '@/types';

// Student-facing committee request APIs. Union review happens in the web portal.

/**
 * Create a new committee role request
 */
export async function createCommitteeRequest(
  requestData: CreateCommitteeRequestInput
): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>('/committee-requests', {
    method: 'POST',
    body: requestData,
  });
}

/**
 * Get committee requests for the current user
 */
export async function getMyCommitteeRequests(): Promise<CommitteeRequest[]> {
  return apiRequest<CommitteeRequest[]>('/committee-requests/me');
}

/**
 * Get a specific committee request by ID
 */
export async function getCommitteeRequest(requestId: string): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>(`/committee-requests/${requestId}`);
}

/**
 * Cancel a pending committee request
 */
export async function cancelCommitteeRequest(requestId: string): Promise<void> {
  return apiRequest(`/committee-requests/${requestId}/cancel`, {
    method: 'POST',
  });
}

/**
 * Update a committee request (for editing pending requests)
 */
export async function updateCommitteeRequest(
  requestId: string,
  updates: Partial<CreateCommitteeRequestInput>
): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>(`/committee-requests/${requestId}`, {
    method: 'PATCH',
    body: updates,
  });
}
