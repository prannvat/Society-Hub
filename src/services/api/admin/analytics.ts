import { apiRequest } from '../client';

export type AdminAnalytics = {
  memberGrowth: {
    period: string;
    count: number;
    change: number;
  }[];
  eventAttendance: {
    eventId: string;
    eventTitle: string;
    rsvpCount: number;
    attendanceRate: number;
  }[];
  engagementMetrics: {
    pollParticipation: number;
    announcementViews: number;
    eventRSVPs: number;
    memberActivity: number;
  };
  topPerformingContent: {
    type: 'event' | 'announcement' | 'poll';
    id: string;
    title: string;
    engagement: number;
  }[];
};

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export async function fetchAdminAnalytics(societyId: string, timeRange: TimeRange = '30d'): Promise<AdminAnalytics> {
  return apiRequest<AdminAnalytics>(`/admin/societies/${societyId}/analytics?range=${timeRange}`);
}

export type MembershipRequest = {
  id: string;
  userId: string;
  societyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    university?: string;
    course?: string;
    year?: string;
  };
};

export async function fetchMembershipRequests(societyId: string): Promise<MembershipRequest[]> {
  return apiRequest<MembershipRequest[]>(`/admin/societies/${societyId}/membership-requests`);
}

export async function approveMembershipRequest(requestId: string): Promise<void> {
  return apiRequest(`/admin/membership-requests/${requestId}/approve`, {
    method: 'POST',
  });
}

export async function rejectMembershipRequest(requestId: string, reason?: string): Promise<void> {
  return apiRequest(`/admin/membership-requests/${requestId}/reject`, {
    method: 'POST',
    body: reason ? { reason } : undefined,
  });
}