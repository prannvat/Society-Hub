import { apiRequest } from './client';

export type ApiAnnouncementCategory = 'GENERAL' | 'EVENTS' | 'IMPORTANT' | 'COMMITTEE';

export type ApiAnnouncement = {
  id: string;
  societyId: string;
  createdById: string;
  title: string;
  preview: string;
  body?: string | null;
  category: ApiAnnouncementCategory;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
};

export async function fetchAnnouncements(societyId: string) {
  return apiRequest<ApiAnnouncement[]>(`/announcements?societyId=${encodeURIComponent(societyId)}`);
}

export async function fetchAnnouncementDetail(announcementId: string) {
  return apiRequest<ApiAnnouncement>(`/announcements/${encodeURIComponent(announcementId)}`);
}

export async function createAnnouncement(input: {
  societyId: string;
  title: string;
  preview: string;
  body?: string;
  category: ApiAnnouncementCategory;
}) {
  return apiRequest<ApiAnnouncement>('/announcements', {
    method: 'POST',
    body: input,
  });
}
