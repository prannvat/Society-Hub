import { apiRequest } from '../client';
import { SocietyRegistrationStatus } from '@/types/union-admin';

// Union Admin — Society Approval Queue

export type UnionSocietyListItem = {
  id: string;
  name: string;
  shortName: string;
  description: string | null;
  logoUrl: string | null;
  registrationStatus: SocietyRegistrationStatus;
  createdAt: string;
  requestedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  _count: {
    memberships: number;
  };
};

export type UnionSocietiesPage = {
  items: UnionSocietyListItem[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * List societies for a university, filterable by registration status.
 */
export async function getUnionSocieties(
  universityId: string,
  filters?: {
    status?: SocietyRegistrationStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<UnionSocietiesPage> {
  const searchParams = new URLSearchParams();
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.page) searchParams.append('page', filters.page.toString());
  if (filters?.pageSize) searchParams.append('pageSize', filters.pageSize.toString());

  const query = searchParams.toString();
  const url = `/union-admin/universities/${universityId}/societies${query ? '?' + query : ''}`;

  return apiRequest<UnionSocietiesPage>(url, {
    universityId,
  });
}

/**
 * Approve a society registration.
 */
export async function approveUnionSociety(
  societyId: string,
  universityId: string
): Promise<UnionSocietyListItem> {
  return apiRequest<UnionSocietyListItem>(`/union-admin/societies/${societyId}/approve`, {
    method: 'POST',
    universityId,
  });
}

/**
 * Reject a society registration with an optional reason.
 */
export async function rejectUnionSociety(
  societyId: string,
  universityId: string,
  reason?: string
): Promise<UnionSocietyListItem> {
  return apiRequest<UnionSocietyListItem>(`/union-admin/societies/${societyId}/reject`, {
    method: 'POST',
    body: reason ? { reason } : {},
    universityId,
  });
}

/**
 * Feature or unfeature a society — the union's paid promotion lever. Featured
 * societies surface in Explore's Featured row.
 */
export async function setUnionSocietyFeatured(
  societyId: string,
  universityId: string,
  featured: boolean
): Promise<{ id: string; isFeatured: boolean }> {
  return apiRequest<{ id: string; isFeatured: boolean }>(
    `/union-admin/societies/${societyId}/${featured ? 'feature' : 'unfeature'}`,
    { method: 'POST', universityId },
  );
}
