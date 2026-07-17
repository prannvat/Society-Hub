import { apiRequest } from '../client';
import { SocietyRole } from '../types';

export type AdminMemberAction = {
  action: 'PROMOTE' | 'DEMOTE' | 'REMOVE' | 'SUSPEND' | 'UNSUSPEND';
  userId: string;
  reason?: string;
  newRole?: SocietyRole;
  duration?: string; // for suspensions
};

export async function performMemberAction(
  societyId: string, 
  memberId: string, 
  action: AdminMemberAction
): Promise<void> {
  return apiRequest(`/admin/societies/${societyId}/members/${memberId}/actions`, {
    method: 'POST',
    body: action,
  });
}

export type BulkMemberAction = {
  action: 'PROMOTE' | 'DEMOTE' | 'REMOVE' | 'NOTIFY';
  memberIds: string[];
  newRole?: SocietyRole;
  message?: string;
};

export async function performBulkMemberAction(
  societyId: string, 
  bulkAction: BulkMemberAction
): Promise<void> {
  return apiRequest(`/admin/societies/${societyId}/members/bulk-actions`, {
    method: 'POST',
    body: bulkAction,
  });
}

export type SocietySettings = {
  joinPolicy: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY' | 'INVITE_ONLY';
  allowEventCreation: boolean;
  allowMemberPolls: boolean;
  autoApproveEvents: boolean;
  requireEventApproval: boolean;
  enableNotifications: boolean;
  publicProfile: boolean;
  allowMemberDirectory: boolean;
  maxEventsPerMonth?: number;
};

export async function fetchSocietySettings(societyId: string): Promise<SocietySettings> {
  return apiRequest<SocietySettings>(`/admin/societies/${societyId}/settings`);
}

export async function updateSocietySettings(
  societyId: string, 
  settings: Partial<SocietySettings>
): Promise<SocietySettings> {
  return apiRequest<SocietySettings>(`/admin/societies/${societyId}/settings`, {
    method: 'PATCH',
    body: settings,
  });
}

export type AdminActivityLog = {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'member' | 'event' | 'announcement' | 'poll' | 'society';
  targetId: string;
  targetName?: string;
  details?: Record<string, any>;
  timestamp: string;
};

export async function fetchAdminActivityLog(
  societyId: string, 
  limit: number = 50,
  offset: number = 0
): Promise<AdminActivityLog[]> {
  return apiRequest<AdminActivityLog[]>(
    `/admin/societies/${societyId}/activity-log?limit=${limit}&offset=${offset}`
  );
}