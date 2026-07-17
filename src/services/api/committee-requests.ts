import { apiRequest } from './client';
import { 
  CommitteeRequest, 
  CommitteeRequestStatus, 
  CreateCommitteeRequestInput,
  MemberRole 
} from '@/types/union-admin';

// Committee Request Management APIs

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

// Union Admin APIs for managing committee requests

/**
 * Get committee requests for a university (union admin only)
 */
export async function getUniversityCommitteeRequests(
  universityId: string,
  filters?: {
    status?: CommitteeRequestStatus;
    societyId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  requests: CommitteeRequest[];
  total: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.societyId) searchParams.append('societyId', filters.societyId);
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/universities/${universityId}/committee-requests${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
    societyId: universityId,
  });
}

/**
 * Approve a committee request (union admin only)
 */
export async function approveCommitteeRequest(
  requestId: string,
  comments?: string
): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>(`/union-admin/committee-requests/${requestId}/approve`, {
    method: 'POST',
    body: comments ? { comments } : undefined,
    requiresAdmin: true,
  });
}

/**
 * Reject a committee request (union admin only)
 */
export async function rejectCommitteeRequest(
  requestId: string,
  reason: string
): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>(`/union-admin/committee-requests/${requestId}/reject`, {
    method: 'POST',
    body: { reason },
    requiresAdmin: true,
  });
}

/**
 * Bulk approve committee requests (union admin only)
 */
export async function bulkApproveCommitteeRequests(
  requestIds: string[],
  comments?: string
): Promise<{ approved: string[]; failed: string[] }> {
  return apiRequest(`/union-admin/committee-requests/bulk-approve`, {
    method: 'POST',
    body: { requestIds, comments },
    requiresAdmin: true,
  });
}

/**
 * Bulk reject committee requests (union admin only)
 */
export async function bulkRejectCommitteeRequests(
  requestIds: string[],
  reason: string
): Promise<{ rejected: string[]; failed: string[] }> {
  return apiRequest(`/union-admin/committee-requests/bulk-reject`, {
    method: 'POST',
    body: { requestIds, reason },
    requiresAdmin: true,
  });
}

/**
 * Get committee request statistics for a university
 */
export async function getCommitteeRequestStats(universityId: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  byRole: Record<MemberRole, number>;
  bySociety: Array<{ societyId: string; societyName: string; count: number }>;
}> {
  return apiRequest(`/union-admin/universities/${universityId}/committee-requests/stats`, {
    requiresAdmin: true,
  });
}