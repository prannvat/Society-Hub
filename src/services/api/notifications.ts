import { apiRequest } from './client';

export type NotificationType =
  | 'COMMENT'
  | 'REPLY'
  | 'MENTION'
  | 'LIKE'
  | 'NEW_POST'
  | 'NEW_EVENT'
  | 'NEW_POLL'
  | 'MEMBERSHIP_APPROVED'
  | 'MEMBERSHIP_REJECTED'
  | 'COMMITTEE_APPROVED'
  | 'COMMITTEE_REJECTED'
  | 'SOCIETY_APPROVED'
  | 'SOCIETY_REJECTED'
  | 'SOCIETY_REVIEW'
  | 'COMMITTEE_REVIEW';

export type NotificationData = {
  societyId?: string;
  announcementId?: string;
  eventId?: string;
  pollId?: string;
  commentId?: string;
  universityId?: string;
  requestId?: string;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: NotificationData;
  actor?: { id: string; fullName: string; avatarUrl?: string | null };
};

export async function fetchNotifications(limit = 30, offset = 0) {
  return apiRequest<Notification[]>(
    `/notifications?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
  );
}

export async function fetchUnreadCount() {
  return apiRequest<{ count: number }>('/notifications/unread-count');
}

/** Mark specific notifications read, or omit `ids` to mark ALL read. */
export async function markNotificationsRead(ids?: string[]) {
  return apiRequest<{ success: true }>('/notifications/read', {
    method: 'POST',
    body: ids ? { ids } : {},
  });
}

export async function registerPushToken(token: string) {
  return apiRequest<{ success: true }>('/me/push-token', {
    method: 'POST',
    body: { token },
  });
}
