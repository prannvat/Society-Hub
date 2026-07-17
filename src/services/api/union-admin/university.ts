import { apiRequest } from '../client';
import { 
  University, 
  UniversitySettings,
  SocietyRegistrationRequest,
  SocietyRegistrationStatus 
} from '@/types/union-admin';

// University Management APIs

/**
 * Get university details for union admin
 */
export async function getUniversityDetails(universityId: string): Promise<University> {
  return apiRequest<University>(`/union-admin/universities/${universityId}`, {
    requiresAdmin: true,
  });
}

/**
 * Update university settings
 */
export async function updateUniversitySettings(
  universityId: string,
  settings: Partial<UniversitySettings>
): Promise<UniversitySettings> {
  return apiRequest<UniversitySettings>(`/universities/${universityId}/settings`, {
    method: 'PATCH',
    body: settings,
    universityId,
  });
}

/**
 * Get university settings
 */
export async function getUniversitySettings(universityId: string): Promise<UniversitySettings> {
  return apiRequest<UniversitySettings>(`/universities/${universityId}/settings`, {
    universityId,
  });
}

// Society Registration Management

/**
 * Get society registration requests for a university
 */
export async function getSocietyRegistrationRequests(
  universityId: string,
  filters?: {
    status?: SocietyRegistrationStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{
  requests: SocietyRegistrationRequest[];
  total: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/universities/${universityId}/society-requests${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
  });
}

/**
 * Approve a society registration request
 */
export async function approveSocietyRegistration(
  requestId: string,
  comments?: string
): Promise<SocietyRegistrationRequest> {
  return apiRequest<SocietyRegistrationRequest>(`/union-admin/society-requests/${requestId}/approve`, {
    method: 'POST',
    body: comments ? { comments } : undefined,
    requiresAdmin: true,
  });
}

/**
 * Reject a society registration request
 */
export async function rejectSocietyRegistration(
  requestId: string,
  reason: string
): Promise<SocietyRegistrationRequest> {
  return apiRequest<SocietyRegistrationRequest>(`/union-admin/society-requests/${requestId}/reject`, {
    method: 'POST',
    body: { reason },
    requiresAdmin: true,
  });
}

/**
 * Request changes to a society registration
 */
export async function requestSocietyChanges(
  requestId: string,
  feedback: string
): Promise<SocietyRegistrationRequest> {
  return apiRequest<SocietyRegistrationRequest>(`/union-admin/society-requests/${requestId}/request-changes`, {
    method: 'POST',
    body: { feedback },
    requiresAdmin: true,
  });
}

// University Analytics

export type UniversityAnalytics = {
  users: {
    total: number;
    verified: number;
    verificationRate: number;
  };
  societies: {
    total: number;
    pending: number;
  };
  committeeRequests: {
    total: number;
    pending: number;
  };
};

/**
 * Get university analytics and statistics
 */
export async function getUniversityAnalytics(universityId: string): Promise<UniversityAnalytics> {
  return apiRequest<UniversityAnalytics>(`/universities/${universityId}/analytics`, {
    universityId,
  });
}

// Bulk Member Management

/**
 * Get all members of a university
 */
export async function getUniversityMembers(
  universityId: string,
  filters?: {
    course?: string;
    year?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }
): Promise<{
  members: Array<{
    id: string;
    fullName: string;
    email: string;
    course?: string;
    year?: string;
    isVerified: boolean;
    societyCount: number;
    lastActive: string;
  }>;
  total: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (filters?.course) searchParams.append('course', filters.course);
  if (filters?.year) searchParams.append('year', filters.year);
  if (filters?.verified !== undefined) searchParams.append('verified', filters.verified.toString());
  if (filters?.search) searchParams.append('search', filters.search);
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/universities/${universityId}/members${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
  });
}

/**
 * Bulk verify students
 */
export async function bulkVerifyStudents(
  universityId: string,
  memberIds: string[]
): Promise<{ verified: string[]; failed: string[] }> {
  return apiRequest(`/union-admin/universities/${universityId}/members/bulk-verify`, {
    method: 'POST',
    body: { memberIds },
    requiresAdmin: true,
  });
}

/**
 * Send bulk notification to university members
 */
export async function sendUniversityNotification(
  universityId: string,
  notification: {
    title: string;
    message: string;
    targetGroups?: ('all' | 'verified' | 'unverified' | 'society_admins')[];
    societies?: string[]; // Specific society IDs
  }
): Promise<{ sent: number; failed: number }> {
  return apiRequest(`/union-admin/universities/${universityId}/notifications`, {
    method: 'POST',
    body: notification,
    requiresAdmin: true,
  });
}