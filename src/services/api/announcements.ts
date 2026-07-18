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
  // Post interactions (student ↔ society)
  likeCount?: number;
  commentCount?: number;
  likedByCurrentUser?: boolean;
};

export type ApiComment = {
  id: string;
  announcementId: string;
  body: string;
  parentId?: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
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

// --- Post interactions ---

export async function likeAnnouncement(announcementId: string) {
  return apiRequest<{ liked: boolean; likeCount: number }>(
    `/announcements/${encodeURIComponent(announcementId)}/like`,
    { method: 'POST' },
  );
}

export async function unlikeAnnouncement(announcementId: string) {
  return apiRequest<{ liked: boolean; likeCount: number }>(
    `/announcements/${encodeURIComponent(announcementId)}/like`,
    { method: 'DELETE' },
  );
}

export async function fetchComments(announcementId: string) {
  return apiRequest<ApiComment[]>(`/announcements/${encodeURIComponent(announcementId)}/comments`);
}

export async function addComment(
  announcementId: string,
  body: string,
  parentId?: string,
  mentionedUserIds?: string[],
) {
  const payload: { body: string; parentId?: string; mentionedUserIds?: string[] } = { body };
  if (parentId) payload.parentId = parentId;
  if (mentionedUserIds && mentionedUserIds.length > 0) payload.mentionedUserIds = mentionedUserIds;
  return apiRequest<ApiComment>(`/announcements/${encodeURIComponent(announcementId)}/comments`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteComment(announcementId: string, commentId: string) {
  return apiRequest<{ success: boolean }>(
    `/announcements/${encodeURIComponent(announcementId)}/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' },
  );
}
