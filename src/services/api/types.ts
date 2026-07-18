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
  isFeatured?: boolean;
  perks?: SocietyPerk[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    memberships: number;
    events: number;
    polls: number;
    announcements: number;
  };
};

export type SocietyPerk = {
  id: string;
  societyId: string;
  title: string;
  description: string;
  createdAt?: string;
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

/**
 * A member as shown on a society's public member list. Deliberately has no
 * email — this list is visible to every signed-in user, like a follower list.
 */
export type PublicSocietyMember = {
  id: string;
  userId: string;
  role: SocietyRole;
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    course: string | null;
    year: string | null;
    isVerifiedStudent: boolean;
  };
};

/** Page-based envelope returned by the public member list endpoint. */
export type PublicSocietyMemberPage = {
  items: PublicSocietyMember[];
  total: number;
  page: number;
  pageSize: number;
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
