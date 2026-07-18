import { apiRequest } from './client';
import { CommitteeRequest, CreateCommitteeRequestInput } from '@/types';
import { mapMemberRole, mapMemberRoleToApi } from '@/utils/mapMemberRole';

// Student-facing committee request APIs. Union review happens in the web portal.

/**
 * The wire shape of a committee request: roles are UPPERCASE on the API and
 * Title-case in the UI, so every request/response crosses `mapMemberRole*`.
 */
type ApiCommitteeRequest = Omit<CommitteeRequest, 'requestedRole' | 'currentRole'> & {
  requestedRole: string;
  currentRole: string;
};

const fromApi = (request: ApiCommitteeRequest): CommitteeRequest => ({
  ...request,
  requestedRole: mapMemberRole(request.requestedRole),
  currentRole: mapMemberRole(request.currentRole),
});

/**
 * Create a new committee role request
 */
export async function createCommitteeRequest(
  requestData: CreateCommitteeRequestInput
): Promise<CommitteeRequest> {
  const created = await apiRequest<ApiCommitteeRequest>('/committee-requests', {
    method: 'POST',
    body: { ...requestData, requestedRole: mapMemberRoleToApi(requestData.requestedRole) },
  });
  return fromApi(created);
}

/**
 * Get committee requests for the current user
 */
export async function getMyCommitteeRequests(): Promise<CommitteeRequest[]> {
  const requests = await apiRequest<ApiCommitteeRequest[]>('/committee-requests/me');
  return requests.map(fromApi);
}

/**
 * Get a specific committee request by ID
 */
export async function getCommitteeRequest(requestId: string): Promise<CommitteeRequest> {
  const request = await apiRequest<ApiCommitteeRequest>(
    `/committee-requests/${encodeURIComponent(requestId)}`,
  );
  return fromApi(request);
}

/**
 * Cancel a pending committee request
 */
export async function cancelCommitteeRequest(requestId: string): Promise<void> {
  return apiRequest(`/committee-requests/${encodeURIComponent(requestId)}`, {
    method: 'DELETE',
  });
}

/**
 * Update a committee request (for editing pending requests)
 */
export async function updateCommitteeRequest(
  requestId: string,
  updates: Partial<CreateCommitteeRequestInput>
): Promise<CommitteeRequest> {
  const updated = await apiRequest<ApiCommitteeRequest>(
    `/committee-requests/${encodeURIComponent(requestId)}`,
    {
      method: 'PATCH',
      body: {
        ...updates,
        ...(updates.requestedRole
          ? { requestedRole: mapMemberRoleToApi(updates.requestedRole) }
          : {}),
      },
    },
  );
  return fromApi(updated);
}
