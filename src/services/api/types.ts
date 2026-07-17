export type SocietyRole = 'MEMBER' | 'COMMITTEE' | 'PRESIDENT';

export type Society = {
  id: string;
  name: string;
  shortName: string;
  university?: string;
  affiliatedUniversities?: string[];
  joinPolicy?: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';
  primaryColor: string;
  secondaryColor: string;
  description: string | null;
  logoUrl?: string | null;
  instagramLink?: string | null;
  whatsappLink?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    memberships: number;
    events: number;
    polls: number;
    announcements: number;
  };
};

export type EventItem = {
  id: string;
  societyId: string;
  createdById?: string;
  title: string;
  description: string;
  location: string;
  locationPlaceId?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  posterImageUrl?: string | null;
  startAt: string;
  endAt: string | null;
  membersOnly: boolean;
  isFree: boolean;
  isRsvpedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { rsvps: number };
};

export type PollOption = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

export type PollItem = {
  id: string;
  societyId: string;
  question: string;
  createdAt: string;
  totalVotes: number;
  currentUserVote: string | null;
  options: PollOption[];
};

export type Membership = {
  id: string;
  userId: string;
  societyId: string;
  role: SocietyRole;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email?: string;
    course?: string;
    year?: string;
    avatarUrl?: string | null;
    isVerifiedStudent?: boolean;
  };
};
