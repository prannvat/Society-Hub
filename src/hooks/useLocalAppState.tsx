import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import {
  ApiAnnouncement,
  ApiAnnouncementCategory,
  ApiError,
  WS_BASE_URL,
  PollItem as ApiPollItem,
  Society as ApiSociety,
  SocietyRole,
  Membership,
  createAnnouncement as createAnnouncementRequest,
  createEvent as createEventRequest,
  createPoll as createPollRequest,
  createSociety as createSocietyRequest,
  fetchAnnouncements,
  fetchEvents,
  fetchMemberships,
  fetchMyMembershipRequests,
  fetchMyMemberships,
  fetchPolls,
  fetchSocieties,
  isPendingJoin,
  joinMembership,
  leaveMembership,
  removeRsvpFromEvent,
  rsvpToEvent,
  updateMe,
  updateSocietyProfile as updateSocietyProfileRequest,
  updateMembershipRole,
  voteOnPoll as voteOnPollRequest,
} from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { mapApiEvent } from '@/utils/mapApiEvent';
import { mapAnnouncementCategory, mapAnnouncementCategoryToApi } from '@/utils/mapAnnouncementCategory';
import { AnnouncementCategory, AnnouncementItem, EventItem, MemberItem, MemberRole, PollItem, SocietyItem } from '@/types';

const DEFAULT_INTERESTS = ['Events', 'Volunteering'];
/** Per-account so switching users doesn't inherit the previous one's interests. */
const interestsKey = (userId: string) => `societyhub_interests_${userId}`;

type ThemePreference = 'Auto' | 'Light' | 'Dark';
type TextSizePreference = 'Small' | 'Medium' | 'Large';

type LocalProfile = {
  isStudent?: boolean;
  location?: string;
  isVerifiedStudent?: boolean;
  fullName: string;
  email: string;
  university: string;
  course: string;
  year: string;
  bio: string;
  instagramLink?: string;
  linkedinLink?: string;
  websiteLink?: string;
  githubLink?: string;
  twitterLink?: string;
  avatarUrl?: string;
};

type ActiveSocietyMember = MemberItem;

type LocalAppStateContextValue = {
  currentUserId: string;
  allSocieties: SocietyItem[];
  mySocietyIds: string[];
  favouritedSocietyIds: string[];
  toggleFavouriteSociety: (societyId: string) => void;
  activeSocietyId: string;
  setActiveSocietyId: (societyId: string) => void;
  activeSocietyRole: MemberRole;
  activeSocietyMembers: ActiveSocietyMember[];
  cycleSociety: () => void;
  createSociety: (society: Omit<SocietyItem, 'id'>) => Promise<string>;
  updateSocietyProfile: (societyId: string, updates: Partial<SocietyItem>) => Promise<void>;
  joinSociety: (societyId: string) => Promise<'JOINED' | 'PENDING'>;
  pendingMembershipSocietyIds: string[];
  activeSocietyMemberCount: number;
  leaveSociety: (societyId: string) => Promise<void>;
  assignMemberRole: (memberId: string, role: MemberRole) => Promise<void>;
  rsvpedEventIds: string[];
  toggleRSVP: (eventId: string) => Promise<void>;
  events: EventItem[];
  exploreEvents: EventItem[];
  isLoadingExplore: boolean;
  loadSocieties: () => Promise<void>;
  loadExploreEvents: () => Promise<void>;
  refreshActiveSociety: () => Promise<void>;
  isLoadingRoleSwitch: boolean;
  addEvent: (event: Omit<EventItem, 'id' | 'societyId' | 'societyName' | 'attendingCount' | 'date' | 'time' | 'location'> & {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    locationPlaceId?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    posterImageUrl?: string;
    startAtIso?: string;
    endAtIso?: string;
    isFree: boolean;
    membersOnly: boolean;
  }) => Promise<string>;
  announcements: AnnouncementItem[];
  addAnnouncement: (announcement: { title: string; preview: string; category: AnnouncementCategory; imageUrl?: string }) => Promise<string>;
  polls: PollItem[];
  createPoll: (poll: { societyId: string; question: string; options: string[] }) => Promise<string>;
  voteOnPoll: (pollId: string, optionId: string) => Promise<void>;
  profile: LocalProfile;
  updateProfile: (nextProfile: LocalProfile) => Promise<void>;
  selectedInterests: string[];
  setSelectedInterests: (interests: string[]) => void;
  pushEnabled: boolean;
  announcementsEnabled: boolean;
  pollUpdatesEnabled: boolean;
  remindersEnabled: boolean;
  setPushEnabled: (enabled: boolean) => void;
  setAnnouncementsEnabled: (enabled: boolean) => void;
  setPollUpdatesEnabled: (enabled: boolean) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  textSizePreference: TextSizePreference;
  setTextSizePreference: (preference: TextSizePreference) => void;
};

const LocalAppStateContext = createContext<LocalAppStateContextValue | undefined>(undefined);

const mapRole = (role: SocietyRole): MemberRole => {
  if (role === 'PRESIDENT') return 'President';
  if (role === 'COMMITTEE') return 'Committee';
  return 'Member';
};

const mapRoleToApi = (role: MemberRole): SocietyRole => {
  if (role === 'President') return 'PRESIDENT';
  if (role === 'Committee') return 'COMMITTEE';
  return 'MEMBER';
};

const mapSociety = (apiSociety: ApiSociety): SocietyItem => ({
  id: apiSociety.id,
  name: apiSociety.name,
  shortName: apiSociety.shortName,
  university: apiSociety.university,
  description: apiSociety.description,
  primaryColor: apiSociety.primaryColor || '#000000',
  secondaryColor: apiSociety.secondaryColor || '#737373',
});

const mapApiPolls = (polls: ApiPollItem[], currentUserId: string): PollItem[] =>
  polls.map((poll) => {
    // The UI counts votes by tallying this map, so it holds one entry per vote:
    // anonymous placeholders for everyone else, plus a real entry keyed by the
    // current user so their own choice can be highlighted. `option.count`
    // already includes the current user's vote, so their option gets one fewer
    // placeholder — otherwise every tally reads one too high.
    const responses: Record<string, string> = {};
    poll.options.forEach((option) => {
      const placeholders =
        poll.currentUserVote === option.id ? option.count - 1 : option.count;
      for (let index = 0; index < placeholders; index += 1) {
        responses[`vote-${poll.id}-${option.id}-${index}`] = option.id;
      }
    });
    if (poll.currentUserVote) {
      responses[currentUserId] = poll.currentUserVote;
    }
    return {
      id: poll.id,
      societyId: poll.societyId,
      question: poll.question,
      createdBy: 'Committee',
      createdAt: new Date(poll.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric' }),
      options: poll.options.map((option) => ({ id: option.id, label: option.label })),
      responses,
    };
  });

/**
 * Posts belong to the SOCIETY, not the committee member who happened to write
 * them — a society is a shared account (like an Instagram page), so every
 * surface attributes content to the society name.
 */
const mapApiAnnouncement = (announcement: ApiAnnouncement, societyName?: string): AnnouncementItem => ({
  id: announcement.id,
  title: announcement.title,
  preview: announcement.preview,
  body: announcement.body ?? undefined,
  imageUrl: announcement.imageUrl ?? undefined,
  category: mapAnnouncementCategory(announcement.category),
  authorName: societyName ?? 'Society',
  timestamp: announcement.createdAt,
  readCount: 0,
  likeCount: announcement.likeCount ?? 0,
  commentCount: announcement.commentCount ?? 0,
  likedByMe: announcement.likedByCurrentUser ?? false,
  societyId: announcement.societyId,
});

const parseTimeTo24Hour = (timeLabel: string) => {
  const match = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute < 0 || minute > 59 || hour < 1 || hour > 12) {
    return null;
  }

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
};

const emptyProfile: LocalProfile = {
  fullName: '',
  email: '',
  university: '',
  course: '',
  year: '',
  bio: '',
};

export const LocalAppStateProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, isAuthenticated, user } = useAuth();
  // The current user's id always comes from the authenticated /me profile.
  const actorUserId = user?.id ?? '';

  const [allSocieties, setAllSocieties] = useState<SocietyItem[]>([]);
  const [mySocietyIds, setMySocietyIds] = useState<string[]>([]);
  const [pendingMembershipSocietyIds, setPendingMembershipSocietyIds] = useState<string[]>([]);
  const [favouritedSocietyIds, setFavouritedSocietyIds] = useState<string[]>([]);
  const [activeSocietyId, setActiveSocietyIdState] = useState<string>('');
  const [rsvpedEventIds, setRsvpedEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [exploreEvents, setExploreEvents] = useState<EventItem[]>([]);
  const [isLoadingExplore, setIsLoadingExplore] = useState(false);
  const [isLoadingRoleSwitch] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [memberRolesBySocietyId, setMemberRolesBySocietyId] = useState<Record<string, Record<string, MemberRole>>>({});
  const [membershipsBySocietyId, setMembershipsBySocietyId] = useState<Record<string, Membership[]>>({});
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [profile, setProfile] = useState<LocalProfile>(emptyProfile);
  // Interests drive Explore's ranking and are chosen during onboarding, so they
  // have to outlive the session. There's no API field for them yet, so they're
  // persisted on-device, keyed per account.
  const [selectedInterests, setSelectedInterestsState] = useState<string[]>(DEFAULT_INTERESTS);

  const setSelectedInterests = useCallback(
    (interests: string[]) => {
      setSelectedInterestsState(interests);
      if (actorUserId) {
        void SecureStore.setItemAsync(interestsKey(actorUserId), JSON.stringify(interests));
      }
    },
    [actorUserId],
  );

  // Restore the active account's saved interests; fall back to the defaults so a
  // new account never inherits the previous one's picks.
  useEffect(() => {
    if (!actorUserId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(interestsKey(actorUserId));
        if (!cancelled) {
          setSelectedInterestsState(stored ? (JSON.parse(stored) as string[]) : DEFAULT_INTERESTS);
        }
      } catch {
        if (!cancelled) setSelectedInterestsState(DEFAULT_INTERESTS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actorUserId]);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(true);
  const [pollUpdatesEnabled, setPollUpdatesEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  // Default to the light (Instagram-white) look rather than following the
  // system into dark. Users can still pick Dark or Auto in Settings.
  const [themePreference, setThemePreference] = useState<ThemePreference>('Light');
  const [textSizePreference, setTextSizePreference] = useState<TextSizePreference>('Medium');
  const currentUserMemberId = actorUserId;

  // Members come from the loaded memberships for the active society — no seed data.
  const activeSocietyMembers = useMemo<ActiveSocietyMember[]>(
    () =>
      (membershipsBySocietyId[activeSocietyId] ?? []).map((membership) => ({
        id: membership.userId,
        name: membership.user?.fullName ?? 'Member',
        year: membership.user?.year ?? '',
        role: mapRole(membership.role),
        universityBadge: membership.user?.isVerifiedStudent ? 'Verified' : '',
      })),
    [activeSocietyId, membershipsBySocietyId],
  );

  const activeSocietyRole = activeSocietyMembers.find((member) => member.id === currentUserMemberId)?.role ?? 'Member';
  const activeSocietyMemberCount = (membershipsBySocietyId[activeSocietyId] ?? []).length;

  const loadSocieties = useCallback(async () => {
    try {
      const apiSocieties = await fetchSocieties();
      // The API is authoritative — an empty result means there are no societies.
      setAllSocieties(apiSocieties.map(mapSociety));
    } catch {
      // Leave current state; screens render their empty/error states.
    }
  }, []);

  const loadExploreEvents = useCallback(async () => {
    if (allSocieties.length === 0) return;
    setIsLoadingExplore(true);
    try {
      const results = await Promise.all(
        allSocieties.map(async (soc) => {
          try {
            const evts = await fetchEvents(soc.id);
            return evts.map((e) => ({ ...mapApiEvent(e), societyName: soc.name }));
          } catch {
            return [];
          }
        }),
      );
      const aggregated = results.flat().sort((a, b) => {
        const tA = a.startAtIso ? new Date(a.startAtIso).getTime() : 0;
        const tB = b.startAtIso ? new Date(b.startAtIso).getTime() : 0;
        return tA - tB;
      });
      setExploreEvents(aggregated);
    } finally {
      setIsLoadingExplore(false);
    }
  }, [allSocieties]);

  const loadSocietyData = useCallback(async (societyId: string) => {
    if (!societyId) {
      return;
    }
    // Settled individually, NOT Promise.all: polls/announcements/memberships are
    // members-only, so browsing a society you haven't joined legitimately 403s
    // on some of them. With Promise.all a single 403 discarded all four results
    // — which also silently demoted a president to 'Member' for the session
    // whenever the memberships call hiccuped.
    const [eventsR, pollsR, membershipsR, announcementsR] = await Promise.allSettled([
      fetchEvents(societyId),
      fetchPolls(societyId),
      fetchMemberships(societyId),
      fetchAnnouncements(societyId),
    ]);

    if (eventsR.status === 'fulfilled') {
      setEvents(eventsR.value.map(mapApiEvent));
      setRsvpedEventIds(
        eventsR.value.filter((entry) => entry.isRsvpedByCurrentUser).map((entry) => entry.id),
      );
    }

    if (pollsR.status === 'fulfilled') {
      setPolls(mapApiPolls(pollsR.value, actorUserId));
    } else {
      setPolls([]);
    }

    if (announcementsR.status === 'fulfilled') {
      // Attribute posts to the society (shared account), not the individual poster.
      const societyName = allSocieties.find((s) => s.id === societyId)?.name;
      setAnnouncements(announcementsR.value.map((a) => mapApiAnnouncement(a, societyName)));
    } else {
      setAnnouncements([]);
    }

    // Only overwrite roles when we actually got a roster back. Clearing them on
    // failure is what caused the silent demotion.
    if (membershipsR.status === 'fulfilled') {
      const memberships = membershipsR.value;
      setMembershipsBySocietyId((prev) => ({ ...prev, [societyId]: memberships }));
      const roles = memberships.reduce<Record<string, MemberRole>>((acc, membership) => {
        acc[membership.userId] = mapRole(membership.role);
        return acc;
      }, {});
      setMemberRolesBySocietyId((prev) => ({ ...prev, [societyId]: roles }));
    }
  }, [actorUserId, allSocieties]);

  // Seed the local profile from the authenticated user; clear all per-user state on logout.
  useEffect(() => {
    if (!user) {
      return;
    }
    // Seeded wholesale from the authenticated user, never merged with the
    // previous value: `user` changes on account switch (while isAuthenticated
    // stays true), so a `prev` fallback would leak the previous account's
    // bio/course/year into any field the new account leaves blank.
    setProfile({
      ...emptyProfile,
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      university: user.university ?? '',
      course: user.course ?? '',
      year: user.year ?? '',
      bio: user.bio ?? '',
      instagramLink: user.instagramLink ?? undefined,
      linkedinLink: user.linkedinLink ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      isVerifiedStudent: user.isVerifiedStudent ?? undefined,
    });
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    setAllSocieties([]);
    setMySocietyIds([]);
    setPendingMembershipSocietyIds([]);
    setFavouritedSocietyIds([]);
    setRsvpedEventIds([]);
    setEvents([]);
    setExploreEvents([]);
    setAnnouncements([]);
    setPolls([]);
    setMembershipsBySocietyId({});
    setMemberRolesBySocietyId({});
    setProfile(emptyProfile);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadSocieties();
    // actorUserId in deps so switching accounts reloads for the new user.
  }, [isAuthenticated, actorUserId, loadSocieties]);

  // Hydrate the user's memberships and pending join requests so they survive app restarts.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [myMemberships, myRequests] = await Promise.all([
          fetchMyMemberships(),
          fetchMyMembershipRequests(),
        ]);
        if (cancelled) return;
        const societyIds = myMemberships.map((membership) => membership.societyId);
        setMySocietyIds(societyIds);
        setPendingMembershipSocietyIds(
          myRequests.filter((request) => request.status === 'PENDING').map((request) => request.societyId),
        );
        setActiveSocietyIdState((prev) => (prev && societyIds.includes(prev) ? prev : societyIds[0] ?? ''));
      } catch {
        // Screens fall back to their empty states; joins made this session still update state directly.
      }
    })();
    return () => {
      cancelled = true;
    };
    // actorUserId in deps so switching accounts re-hydrates memberships for the new user.
  }, [isAuthenticated, actorUserId]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadSocietyData(activeSocietyId);
  }, [isAuthenticated, activeSocietyId, loadSocietyData]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const socket = io(`${WS_BASE_URL}/polls`, { transports: ['websocket'], auth: { token: accessToken } });
    socket.on('connect', () => socket.emit('polls.subscribe', { societyId: activeSocietyId }));
    socket.on('polls.updated', (payload: ApiPollItem[]) => setPolls(mapApiPolls(payload, actorUserId)));
    return () => {
      socket.disconnect();
    };
  }, [accessToken, activeSocietyId, actorUserId]);

  const refreshActiveSociety = useCallback(() => loadSocietyData(activeSocietyId), [activeSocietyId, loadSocietyData]);

  const setActiveSocietyId = useCallback((societyId: string) => {
    setActiveSocietyIdState(societyId);
  }, []);

  const toggleFavouriteSociety = useCallback((societyId: string) => {
    setFavouritedSocietyIds((prev) =>
      prev.includes(societyId) ? prev.filter((id) => id !== societyId) : [...prev, societyId]
    );
  }, []);

  const cycleSociety = () => {
    if (mySocietyIds.length === 0) return;
    const currentIndex = mySocietyIds.indexOf(activeSocietyId);
    const nextSocietyId = mySocietyIds[(currentIndex + 1) % mySocietyIds.length];
    setActiveSocietyId(nextSocietyId);
  };

  const createSociety = async (society: Omit<SocietyItem, 'id'>) => {
    const created = await createSocietyRequest({
      name: society.name,
      shortName: society.shortName,
      university: society.university || undefined,
      joinPolicy: society.joinPolicy,
      description: society.description ?? '',
    });
    const mapped = mapSociety(created);
    setAllSocieties((prev) => [mapped, ...prev]);
    setMySocietyIds((prev) => (prev.includes(mapped.id) ? prev : [...prev, mapped.id]));
    setActiveSocietyId(mapped.id);
    return mapped.id;
  };

  const updateSocietyProfile = async (societyId: string, updates: Partial<SocietyItem>) => {
    // Exact Endpoint Implementation
    const apiResponse = await updateSocietyProfileRequest(societyId, {
      name: updates.name,
      shortName: updates.shortName,
      university: updates.university,
      description: updates.description || null,
      logoUrl: updates.logoUrl || null,
      instagramLink: updates.instagramLink || null,
      whatsappLink: updates.whatsappLink || null,
    });
    setAllSocieties((prev) =>
      prev.map((soc) => (soc.id === societyId ? { ...soc, ...apiResponse } : soc))
    );
  };

  const joinSociety = async (societyId: string): Promise<'JOINED' | 'PENDING'> => {
    const result = await joinMembership(societyId);
    if (isPendingJoin(result)) {
      // Approval-required society: membership is requested, not granted yet.
      setPendingMembershipSocietyIds((prev) => (prev.includes(societyId) ? prev : [...prev, societyId]));
      return 'PENDING';
    }
    setMySocietyIds((prev) => (prev.includes(societyId) ? prev : [...prev, societyId]));
    setPendingMembershipSocietyIds((prev) => prev.filter((id) => id !== societyId));
    if (!activeSocietyId) {
      setActiveSocietyIdState(societyId);
    }
    await loadSocietyData(societyId);
    return 'JOINED';
  };

  const leaveSociety = async (societyId: string) => {
    await leaveMembership(societyId);
    setMySocietyIds((prev) => prev.filter((id) => id !== societyId));
    if (activeSocietyId === societyId) {
      const remaining = mySocietyIds.filter((id) => id !== societyId);
      if (remaining.length > 0) setActiveSocietyId(remaining[0]);
    }
  };

  const assignMemberRole = async (memberId: string, role: MemberRole) => {
    const memberships = membershipsBySocietyId[activeSocietyId] ?? (await fetchMemberships(activeSocietyId));
    const target = memberships.find((entry) => entry.userId === memberId);
    if (!target) return;
    await updateMembershipRole(target.id, mapRoleToApi(role));
    await loadSocietyData(activeSocietyId);
  };

  const toggleRSVP = async (eventId: string) => {
    const isCurrentlyRsvped = rsvpedEventIds.includes(eventId);
    if (isCurrentlyRsvped) {
      await removeRsvpFromEvent(eventId);
      setRsvpedEventIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      await rsvpToEvent(eventId);
      setRsvpedEventIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
    }
    await loadSocietyData(activeSocietyId);
  };

  const addEvent = async (
    event: Omit<EventItem, 'id' | 'societyId' | 'societyName' | 'attendingCount' | 'date' | 'time' | 'location'> & {
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      locationPlaceId?: string;
      locationLatitude?: number;
      locationLongitude?: number;
      posterImageUrl?: string;
      startAtIso?: string;
      endAtIso?: string;
    },
  ) => {
    let startAt: Date;

    if (event.startAtIso) {
      startAt = new Date(event.startAtIso);
    } else {
      const dateOnly = new Date(event.date);
      if (Number.isNaN(dateOnly.getTime())) {
        throw new Error('Please pick a valid event date.');
      }

      const parsedTime = parseTimeTo24Hour(event.time);
      if (!parsedTime) {
        throw new Error('Please pick a valid event time.');
      }

      startAt = new Date(dateOnly);
      startAt.setHours(parsedTime.hour, parsedTime.minute, 0, 0);
    }

    if (Number.isNaN(startAt.getTime())) {
      throw new Error('We could not read that date and time. Please select them again.');
    }

    const payload = {
      societyId: activeSocietyId,
      title: event.title,
      description: event.description.trim() || `${event.title} event`,
      location: event.location,
      locationPlaceId: event.locationPlaceId,
      locationLatitude: event.locationLatitude,
      locationLongitude: event.locationLongitude,
      posterImageUrl: event.posterImageUrl?.trim() || undefined,
      startAt: startAt.toISOString(),
      endAt: event.endAtIso,
      membersOnly: event.membersOnly,
      isFree: event.isFree,
    };

    let created;
    try {
      created = await createEventRequest(payload);
    } catch (error) {
      const shouldRetryLegacy =
        error instanceof ApiError &&
        error.statusCode === 400 &&
        payload.posterImageUrl &&
        /poster|image|url/i.test(error.message);

      if (!shouldRetryLegacy) {
        throw error;
      }

      // Retry with the legacy shape for backends that reject poster media field.
      created = await createEventRequest({
        societyId: payload.societyId,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        startAt: payload.startAt,
        membersOnly: payload.membersOnly,
        isFree: payload.isFree,
      });
    }

    await loadSocietyData(activeSocietyId);
    return created.id;
  };

  const addAnnouncement = async (announcement: {
    title: string;
    preview: string;
    category: AnnouncementCategory;
    imageUrl?: string;
  }) => {
    const created = await createAnnouncementRequest({
      societyId: activeSocietyId,
      title: announcement.title,
      preview: announcement.preview,
      body: announcement.preview,
      imageUrl: announcement.imageUrl,
      category: mapAnnouncementCategoryToApi(announcement.category),
    });
    await loadSocietyData(activeSocietyId);
    return created.id;
  };

  const createPoll = async (poll: { societyId: string; question: string; options: string[] }) => {
    const response = await createPollRequest(poll);
    await loadSocietyData(poll.societyId);
    return response.id;
  };

  const voteOnPoll = async (pollId: string, optionId: string) => {
    await voteOnPollRequest(pollId, optionId);
  };

  const updateProfile = async (nextProfile: LocalProfile) => {
    // fullName/university/course/year are @IsNotEmpty on the API: sending ''
    // for one a user hasn't filled in fails the WHOLE save. Omit them instead
    // — they're @IsOptional, so leaving them out keeps the stored value.
    // bio/links/avatar are nullable, so '' is sent as null to clear them.
    const optionalText = (value: string) => (value.trim() ? value.trim() : undefined);
    const apiResponse = await updateMe({
      fullName: optionalText(nextProfile.fullName),
      university: optionalText(nextProfile.university),
      course: optionalText(nextProfile.course),
      year: optionalText(nextProfile.year),
      bio: nextProfile.bio || null,
      instagramLink: nextProfile.instagramLink || null,
      linkedinLink: nextProfile.linkedinLink || null,
      avatarUrl: nextProfile.avatarUrl || null,
    });
    setProfile({
      ...nextProfile,
      fullName: apiResponse.fullName,
      email: apiResponse.email, // backend source of truth
    });
  };

  const value = useMemo(
    () => ({
      currentUserId: actorUserId,
      allSocieties,
      mySocietyIds,
      favouritedSocietyIds,
      toggleFavouriteSociety,
      activeSocietyId,
      setActiveSocietyId,
      activeSocietyRole,
      activeSocietyMembers,
      cycleSociety,
      createSociety,
      updateSocietyProfile,
      joinSociety,
      pendingMembershipSocietyIds,
      activeSocietyMemberCount,
      leaveSociety,
      assignMemberRole,
      rsvpedEventIds,
      toggleRSVP,
      events,
      exploreEvents,
      isLoadingExplore,
      loadSocieties,
      loadExploreEvents,
      refreshActiveSociety,
      isLoadingRoleSwitch,
      addEvent,
      announcements,
      addAnnouncement,
      polls,
      createPoll,
      voteOnPoll,
      profile,
      updateProfile,
      selectedInterests,
      setSelectedInterests,
      pushEnabled,
      announcementsEnabled,
      pollUpdatesEnabled,
      remindersEnabled,
      setPushEnabled,
      setAnnouncementsEnabled,
      setPollUpdatesEnabled,
      setRemindersEnabled,
      themePreference,
      setThemePreference,
      textSizePreference,
      setTextSizePreference,
    }),
    [
      actorUserId,
      allSocieties,
      mySocietyIds,
      favouritedSocietyIds,
      toggleFavouriteSociety,
      activeSocietyId,
      activeSocietyRole,
      activeSocietyMembers,
      activeSocietyMemberCount,
      pendingMembershipSocietyIds,
      rsvpedEventIds,
      events,
      exploreEvents,
      isLoadingExplore,
      announcements,
      isLoadingRoleSwitch,
      polls,
      profile,
      selectedInterests,
      pushEnabled,
      announcementsEnabled,
      pollUpdatesEnabled,
      remindersEnabled,
      themePreference,
      textSizePreference,
      setActiveSocietyId,
      loadSocieties,
      loadExploreEvents,
      refreshActiveSociety,
    ],
  );

  return <LocalAppStateContext.Provider value={value}>{children}</LocalAppStateContext.Provider>;
};

export const useLocalAppState = () => {
  const context = useContext(LocalAppStateContext);
  if (!context) throw new Error('useLocalAppState must be used within LocalAppStateProvider');
  return context;
};
