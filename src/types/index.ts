export type ThemeMode = 'light' | 'dark';

export type EventItem = {
  id: string;
  societyId: string;
  societyName?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  startAtIso?: string;
  endAtIso?: string | null;
  location: string;
  locationPlaceId?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  posterImageUrl?: string;
  isFree: boolean;
  membersOnly: boolean;
  attendingCount: number;
  isRsvpedByCurrentUser?: boolean;
};

export type AnnouncementCategory = 'General' | 'Events' | 'Important' | 'Committee';

export type AnnouncementItem = {
  id: string;
  title: string;
  preview: string;
  body?: string;
  category: AnnouncementCategory;
  authorName: string;
  timestamp: string;
  readCount: number;
  pinned?: boolean;
};

export type MemberRole = 'Member' | 'Committee' | 'President';

export type UserRole = 'Student' | 'Admin';

export type AppMode = 'Consumer' | 'Admin' | 'UnionAdmin';

export type SocietyAdminRelationship = {
  societyId: string;
  societyName: string;
  role: MemberRole;
  canManage: boolean;
};

export type UserRoleData = {
  userRole: UserRole;
  adminSocieties: SocietyAdminRelationship[];
  hasAdminAccess: boolean;
  canSwitchToAdmin: boolean;
};

export type MemberItem = {
  id: string;
  name: string;
  year: string;
  role: MemberRole;
  universityBadge: string;
  online?: boolean;
};

export type PollOption = {
  id: string;
  label: string;
};

export type PollItem = {
  id: string;
  societyId: string;
  question: string;
  createdBy: string;
  createdAt: string;
  options: PollOption[];
  responses: Record<string, string>;
};

export type AdminStats = {
  totalMembers: number;
  eventsThisMonth: number;
  announcements: number;
  activeNow: number;
};

export type SocietyItem = {
  id: string;
  name: string;
  shortName: string;
  university?: string;
  universityId?: string; // FK to University entity
  affiliatedUniversities?: string[];
  joinPolicy?: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';
  registrationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_CHANGES';
  primaryColor: string;
  secondaryColor: string;
  description?: string | null;
  logoUrl?: string | null;
  instagramLink?: string | null;
  whatsappLink?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: any;
};

// Export union admin types
export * from './union-admin';
