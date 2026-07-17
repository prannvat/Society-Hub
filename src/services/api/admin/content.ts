import { apiRequest } from '../client';
import { ApiAnnouncementCategory } from '../announcements';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export type AdminEvent = {
  id: string;
  societyId: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  location: string;
  locationPlaceId?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  posterImageUrl?: string;
  isFree: boolean;
  membersOnly: boolean;
  maxAttendees?: number;
  status: ContentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rsvps: number;
  };
};

export type CreateEventInput = {
  societyId: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  location: string;
  locationPlaceId?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  posterImageUrl?: string;
  isFree: boolean;
  membersOnly: boolean;
  maxAttendees?: number;
  scheduledFor?: string; // for scheduled publishing
};

export async function createEventAsAdmin(eventData: CreateEventInput): Promise<AdminEvent> {
  return apiRequest<AdminEvent>('/admin/events', {
    method: 'POST',
    body: eventData,
  });
}

export async function updateEvent(eventId: string, updates: Partial<CreateEventInput>): Promise<AdminEvent> {
  return apiRequest<AdminEvent>(`/admin/events/${eventId}`, {
    method: 'PATCH',
    body: updates,
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  return apiRequest(`/admin/events/${eventId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminEvents(
  societyId: string,
  status?: ContentStatus
): Promise<AdminEvent[]> {
  const query = status ? `?status=${status}` : '';
  return apiRequest<AdminEvent[]>(`/admin/societies/${societyId}/events${query}`);
}

export type AdminAnnouncement = {
  id: string;
  societyId: string;
  title: string;
  preview: string;
  body: string;
  category: ApiAnnouncementCategory;
  status: ContentStatus;
  pinned: boolean;
  scheduledFor?: string;
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    views: number;
    reactions: number;
  };
};

export type CreateAnnouncementInput = {
  societyId: string;
  title: string;
  preview: string;
  body: string;
  category: ApiAnnouncementCategory;
  pinned?: boolean;
  scheduledFor?: string;
};

export async function createAnnouncementAsAdmin(
  announcementData: CreateAnnouncementInput
): Promise<AdminAnnouncement> {
  return apiRequest<AdminAnnouncement>('/admin/announcements', {
    method: 'POST',
    body: announcementData,
  });
}

export async function updateAnnouncement(
  announcementId: string, 
  updates: Partial<CreateAnnouncementInput>
): Promise<AdminAnnouncement> {
  return apiRequest<AdminAnnouncement>(`/admin/announcements/${announcementId}`, {
    method: 'PATCH',
    body: updates,
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  return apiRequest(`/admin/announcements/${announcementId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminAnnouncements(
  societyId: string,
  status?: ContentStatus
): Promise<AdminAnnouncement[]> {
  const query = status ? `?status=${status}` : '';
  return apiRequest<AdminAnnouncement[]>(`/admin/societies/${societyId}/announcements${query}`);
}

export type ContentSchedule = {
  id: string;
  type: 'event' | 'announcement';
  contentId: string;
  title: string;
  scheduledFor: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  createdAt: string;
};

export async function fetchScheduledContent(societyId: string): Promise<ContentSchedule[]> {
  return apiRequest<ContentSchedule[]>(`/admin/societies/${societyId}/scheduled-content`);
}

export async function cancelScheduledContent(scheduleId: string): Promise<void> {
  return apiRequest(`/admin/scheduled-content/${scheduleId}/cancel`, {
    method: 'POST',
  });
}