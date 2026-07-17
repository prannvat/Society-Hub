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

// Membership request review lives in services/api/memberships.ts
// (/memberships/requests endpoints) — the single source of truth.