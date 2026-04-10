export type ThemeMode = 'light' | 'dark';

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isFree: boolean;
  membersOnly: boolean;
  attendingCount: number;
};

export type AnnouncementCategory = 'General' | 'Events' | 'Important' | 'Committee';

export type AnnouncementItem = {
  id: string;
  title: string;
  preview: string;
  category: AnnouncementCategory;
  authorName: string;
  timestamp: string;
  readCount: number;
  pinned?: boolean;
};

export type MemberRole = 'Member' | 'Committee' | 'President';

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
  university: string;
  primaryColor: string;
  secondaryColor: string;
  description?: string;
};
