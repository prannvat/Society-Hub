import { apiRequest } from '../client';
import { 
  CommitteeRequest, 
  CommitteeRequestStatus,
  SocietyRegistrationRequest,
  SocietyRegistrationStatus,
  Notification 
} from '@/types/union-admin';

// Committee Request Management (Re-export with admin context)

/**
 * Get all committee requests across all universities for super admin
 */
export async function getAllCommitteeRequests(filters?: {
  universityId?: string;
  status?: CommitteeRequestStatus;
  limit?: number;
  offset?: number;
}): Promise<{
  requests: CommitteeRequest[];
  total: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (filters?.universityId) searchParams.append('universityId', filters.universityId);
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/committee-requests${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
  });
}

/**
 * Get committee request details with full context
 */
export async function getCommitteeRequestDetails(requestId: string): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>(`/union-admin/committee-requests/${requestId}`, {
    requiresAdmin: true,
  });
}

/**
 * Add admin comment to committee request
 */
export async function addCommitteeRequestComment(
  requestId: string,
  comment: string,
  isPublic: boolean = true
): Promise<CommitteeRequest> {
  return apiRequest<CommitteeRequest>(`/union-admin/committee-requests/${requestId}/comments`, {
    method: 'POST',
    body: { comment, isPublic },
    requiresAdmin: true,
  });
}

// Society Registration Request Management

/**
 * Get society registration request details
 */
export async function getSocietyRegistrationDetails(requestId: string): Promise<SocietyRegistrationRequest> {
  return apiRequest<SocietyRegistrationRequest>(`/union-admin/society-requests/${requestId}`, {
    requiresAdmin: true,
  });
}

/**
 * Get all society registration requests across universities
 */
export async function getAllSocietyRegistrationRequests(filters?: {
  universityId?: string;
  status?: SocietyRegistrationStatus;
  limit?: number;
  offset?: number;
}): Promise<{
  requests: SocietyRegistrationRequest[];
  total: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (filters?.universityId) searchParams.append('universityId', filters.universityId);
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/society-requests${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
  });
}

// Notification Management

/**
 * Get notifications for union admin
 */
export async function getUnionAdminNotifications(
  universityId?: string,
  filters?: {
    type?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (universityId) searchParams.append('universityId', universityId);
  if (filters?.type) searchParams.append('type', filters.type);
  if (filters?.isRead !== undefined) searchParams.append('isRead', filters.isRead.toString());
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/notifications${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  return apiRequest(`/union-admin/notifications/${notificationId}/read`, {
    method: 'POST',
    requiresAdmin: true,
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(universityId?: string): Promise<{ updated: number }> {
  return apiRequest('/union-admin/notifications/mark-all-read', {
    method: 'POST',
    body: universityId ? { universityId } : undefined,
    requiresAdmin: true,
  });
}

// Audit Trail and Activity Logs

/**
 * Get admin activity logs
 */
export async function getAdminActivityLogs(
  universityId: string,
  filters?: {
    adminId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  logs: Array<{
    id: string;
    adminId: string;
    adminName: string;
    action: string;
    description: string;
    metadata: Record<string, any>;
    timestamp: string;
    ipAddress?: string;
  }>;
  total: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  if (filters?.adminId) searchParams.append('adminId', filters.adminId);
  if (filters?.action) searchParams.append('action', filters.action);
  if (filters?.startDate) searchParams.append('startDate', filters.startDate);
  if (filters?.endDate) searchParams.append('endDate', filters.endDate);
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.offset) searchParams.append('offset', filters.offset.toString());

  const query = searchParams.toString();
  const url = `/union-admin/universities/${universityId}/activity-logs${query ? '?' + query : ''}`;
  
  return apiRequest(url, {
    requiresAdmin: true,
  });
}

// System Health and Monitoring

/**
 * Get system health status for university
 */
export async function getUniversitySystemHealth(universityId: string): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    count: number;
  }>;
  metrics: {
    apiResponseTime: number;
    errorRate: number;
    activeUsers: number;
    systemLoad: number;
  };
  lastUpdated: string;
}> {
  return apiRequest(`/union-admin/universities/${universityId}/health`, {
    requiresAdmin: true,
  });
}

/**
 * Export university data for backup/compliance
 */
export async function exportUniversityData(
  universityId: string,
  format: 'json' | 'csv' | 'excel' = 'json',
  includePersonalData: boolean = false
): Promise<{
  downloadUrl: string;
  expiresAt: string;
  fileSize: number;
}> {
  return apiRequest(`/union-admin/universities/${universityId}/export`, {
    method: 'POST',
    body: { format, includePersonalData },
    requiresAdmin: true,
  });
}