import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { societies } from '@/data/societies';
import { events as initialEvents } from '@/data/events';
import { announcements as initialAnnouncements } from '@/data/announcements';
import { members as initialMembers } from '@/data/members';
import { AnnouncementCategory, AnnouncementItem, EventItem, MemberRole, PollItem, SocietyItem } from '@/types';

type ThemePreference = 'Auto' | 'Light' | 'Dark';
type TextSizePreference = 'Small' | 'Medium' | 'Large';

type LocalProfile = {
  fullName: string;
  email: string;
  university: string;
  course: string;
  year: string;
  bio: string;
};

type ActiveSocietyMember = (typeof initialMembers)[number] & { role: MemberRole };

type LocalAppStateContextValue = {
  allSocieties: SocietyItem[];
  mySocietyIds: string[];
  activeSocietyId: string;
  setActiveSocietyId: (societyId: string) => void;
  activeSocietyRole: MemberRole;
  activeSocietyMembers: ActiveSocietyMember[];
  cycleSociety: () => void;
  createSociety: (society: Omit<SocietyItem, 'id'>) => string;
  joinSociety: (societyId: string) => void;
  leaveSociety: (societyId: string) => void;
  assignMemberRole: (memberId: string, role: MemberRole) => void;
  isAdminMode: boolean;
  setIsAdminMode: (enabled: boolean) => void;
  rsvpedEventIds: string[];
  toggleRSVP: (eventId: string) => void;
  events: EventItem[];
  addEvent: (event: Omit<EventItem, 'id' | 'attendingCount'>) => string;
  announcements: AnnouncementItem[];
  addAnnouncement: (announcement: { title: string; preview: string; category: AnnouncementCategory }) => string;
  polls: PollItem[];
  createPoll: (poll: { societyId: string; question: string; options: string[] }) => string;
  voteOnPoll: (pollId: string, optionId: string) => void;
  profile: LocalProfile;
  updateProfile: (nextProfile: LocalProfile) => void;
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

type LocalAppStateProviderProps = {
  children: ReactNode;
};

export const LocalAppStateProvider = ({ children }: LocalAppStateProviderProps) => {
  const [allSocieties, setAllSocieties] = useState<SocietyItem[]>(societies);
  const [mySocietyIds, setMySocietyIds] = useState<string[]>(['manc-sikh', 'manc-tech']);
  const [activeSocietyId, setActiveSocietyIdState] = useState(mySocietyIds[0]);
  const currentUserMemberId = 'm3';
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [memberRolesBySocietyId, setMemberRolesBySocietyId] = useState<Record<string, Record<string, MemberRole>>>(() => ({
    'manc-sikh': {
      m1: 'Committee',
      m2: 'Member',
      m3: 'President',
      m4: 'Member',
      m5: 'Committee',
      m6: 'Member',
      m7: 'Member',
      m8: 'Committee',
      m9: 'Member',
      m10: 'Member',
      m11: 'Member',
      m12: 'Member',
      m13: 'Committee',
      m14: 'Member',
      m15: 'Member',
      m16: 'Member',
      m17: 'Committee',
      m18: 'Member',
      m19: 'Member',
      m20: 'Member'
    },
    'manc-tech': {
      m1: 'Member',
      m2: 'Committee',
      m3: 'Member',
      m4: 'Committee',
      m5: 'Member',
      m6: 'Member',
      m7: 'Member',
      m8: 'Member',
      m9: 'Committee',
      m10: 'Member',
      m11: 'Committee',
      m12: 'Member',
      m13: 'Member',
      m14: 'Member',
      m15: 'Member',
      m16: 'Member',
      m17: 'Member',
      m18: 'Member',
      m19: 'Member',
      m20: 'Member'
    },
    'manc-debate': {
      m1: 'Member',
      m2: 'Member',
      m3: 'Member',
      m4: 'Member',
      m5: 'Member',
      m6: 'Committee',
      m7: 'Member',
      m8: 'Member',
      m9: 'Member',
      m10: 'Committee',
      m11: 'Member',
      m12: 'Member',
      m13: 'Member',
      m14: 'Member',
      m15: 'Committee',
      m16: 'Member',
      m17: 'Member',
      m18: 'Member',
      m19: 'Member',
      m20: 'Member'
    }
  }));
  const [polls, setPolls] = useState<PollItem[]>([
    {
      id: 'poll-sikh-1',
      societyId: 'manc-sikh',
      question: 'Which day should we run the next seva volunteer shift?',
      createdBy: 'President',
      createdAt: '2h ago',
      options: [
        { id: 'fri-evening', label: 'Friday evening' },
        { id: 'sat-morning', label: 'Saturday morning' },
        { id: 'sun-afternoon', label: 'Sunday afternoon' }
      ],
      responses: {
        m1: 'fri-evening',
        m3: 'sat-morning',
        m5: 'sat-morning',
        m9: 'sun-afternoon'
      }
    },
    {
      id: 'poll-tech-1',
      societyId: 'manc-tech',
      question: 'What should the next workshop focus on?',
      createdBy: 'Committee',
      createdAt: '4h ago',
      options: [
        { id: 'react', label: 'React Native UI' },
        { id: 'ai', label: 'AI tools' },
        { id: 'backend', label: 'Backend architecture' }
      ],
      responses: {
        m2: 'react',
        m4: 'ai',
        m9: 'react',
        m11: 'backend'
      }
    }
  ]);
  const [profile, setProfile] = useState<LocalProfile>({
    fullName: 'Harleen Kaur',
    email: 'harleen@manchester.ac.uk',
    university: 'University of Manchester',
    course: 'Computer Science',
    year: '3rd Year',
    bio: 'Passionate about community events, student wellbeing, and mentoring freshers.'
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Events', 'Volunteering']);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(true);
  const [pollUpdatesEnabled, setPollUpdatesEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [themePreference, setThemePreference] = useState<ThemePreference>('Auto');
  const [textSizePreference, setTextSizePreference] = useState<TextSizePreference>('Medium');

  const activeSocietyMembers = useMemo(
    () =>
      initialMembers.map((member) => ({
        ...member,
        role: memberRolesBySocietyId[activeSocietyId]?.[member.id] ?? member.role
      })),
    [activeSocietyId, memberRolesBySocietyId]
  );

  const activeSocietyRole = activeSocietyMembers.find((member) => member.id === currentUserMemberId)?.role ?? 'Member';

  const setActiveSocietyId = useCallback(
    (societyId: string) => {
      setActiveSocietyIdState(societyId);
      const nextRole = memberRolesBySocietyId[societyId]?.[currentUserMemberId] ?? 'Member';
      if (nextRole === 'Member') {
        setIsAdminMode(false);
      }
    },
    [memberRolesBySocietyId]
  );

  const cycleSociety = () => {
    if (mySocietyIds.length === 0) return;
    const currentIndex = mySocietyIds.indexOf(activeSocietyId);
    const nextSocietyId = mySocietyIds[(currentIndex + 1) % mySocietyIds.length];
    setActiveSocietyId(nextSocietyId);
  };

  const createSociety = (society: Omit<SocietyItem, 'id'>) => {
    const newId = `soc-${Date.now()}`;
    const newSociety: SocietyItem = { ...society, id: newId };

    setAllSocieties((prev) => [...prev, newSociety]);
    setMySocietyIds((prev) => [...prev, newId]);
    setActiveSocietyId(newId);
    setMemberRolesBySocietyId((prev) => ({
      ...prev,
      [newId]: {
        [currentUserMemberId]: 'President'
      }
    }));

    return newId;
  };

  const joinSociety = (societyId: string) => {
    if (!mySocietyIds.includes(societyId)) {
      setMySocietyIds((prev) => [...prev, societyId]);
      if (mySocietyIds.length === 0) {
        setActiveSocietyId(societyId);
      }
    }

    setMemberRolesBySocietyId((prev) => ({
      ...prev,
      [societyId]: {
        ...(prev[societyId] ?? {}),
        [currentUserMemberId]: prev[societyId]?.[currentUserMemberId] ?? 'Member'
      }
    }));
  };

  const leaveSociety = (societyId: string) => {
    setMySocietyIds((prev) => prev.filter((id) => id !== societyId));
    setMemberRolesBySocietyId((prev) => {
      const nextRoles = { ...(prev[societyId] ?? {}) };
      delete nextRoles[currentUserMemberId];
      return {
        ...prev,
        [societyId]: nextRoles
      };
    });
    if (activeSocietyId === societyId) {
      setIsAdminMode(false);
      const remaining = mySocietyIds.filter((id) => id !== societyId);
      if (remaining.length > 0) {
        setActiveSocietyId(remaining[0]);
      }
    }
  };

  const assignMemberRole = (memberId: string, role: MemberRole) => {
    setMemberRolesBySocietyId((prev) => {
      const societyRoles = prev[activeSocietyId] ?? {};
      const currentRole = societyRoles[memberId];

      // Safety guards: President role cannot be overridden here, and users cannot self-demote.
      if (currentRole === 'President') {
        return prev;
      }

      if (memberId === currentUserMemberId && role !== 'President') {
        return prev;
      }

      if (currentRole === role) {
        return prev;
      }

      return {
        ...prev,
        [activeSocietyId]: {
          ...societyRoles,
          [memberId]: role
        }
      };
    });
  };

  const toggleRSVP = (eventId: string) => {
    setRsvpedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const addEvent = (event: Omit<EventItem, 'id' | 'attendingCount'>) => {
    const newId = `local-event-${Date.now()}`;
    const nextEvent: EventItem = {
      ...event,
      id: newId,
      attendingCount: 0
    };

    setEvents((prev) => [nextEvent, ...prev]);
    return newId;
  };

  const addAnnouncement = (announcement: { title: string; preview: string; category: AnnouncementCategory }) => {
    const newId = `local-announcement-${Date.now()}`;
    const nextAnnouncement: AnnouncementItem = {
      id: newId,
      title: announcement.title,
      preview: announcement.preview,
      category: announcement.category,
      authorName: 'You',
      timestamp: 'Just now',
      readCount: 0
    };

    setAnnouncements((prev) => [nextAnnouncement, ...prev]);
    return newId;
  };

  const createPoll = (poll: { societyId: string; question: string; options: string[] }) => {
    const question = poll.question.trim();
    const optionLabels = poll.options.map((option) => option.trim()).filter(Boolean);

    if (!question || optionLabels.length < 2) {
      return '';
    }

    const newId = `local-poll-${Date.now()}`;
    const nextPoll: PollItem = {
      id: newId,
      societyId: poll.societyId,
      question,
      createdBy: 'You',
      createdAt: 'Just now',
      options: optionLabels.map((label, index) => ({
        id: `${newId}-option-${index}`,
        label
      })),
      responses: {}
    };

    setPolls((prev) => [nextPoll, ...prev]);
    return newId;
  };

  const voteOnPoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              responses: {
                ...poll.responses,
                [currentUserMemberId]: optionId
              }
            }
          : poll
      )
    );
  };

  const updateProfile = (nextProfile: LocalProfile) => {
    setProfile(nextProfile);
  };

  const value = useMemo(
    () => ({
      allSocieties,
      mySocietyIds,
      activeSocietyId,
      setActiveSocietyId,
      activeSocietyRole,
      activeSocietyMembers,
      cycleSociety,
      createSociety,
      joinSociety,
      leaveSociety,
      assignMemberRole,
      isAdminMode,
      setIsAdminMode,
      rsvpedEventIds,
      toggleRSVP,
      events,
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
      setTextSizePreference
    }),
    [
      allSocieties,
      mySocietyIds,
      activeSocietyId,
      activeSocietyRole,
      activeSocietyMembers,
      isAdminMode,
      rsvpedEventIds,
      events,
      announcements,
      polls,
      profile,
      selectedInterests,
      pushEnabled,
      announcementsEnabled,
      pollUpdatesEnabled,
      remindersEnabled,
      themePreference,
      textSizePreference
    ]
  );

  return <LocalAppStateContext.Provider value={value}>{children}</LocalAppStateContext.Provider>;
};

export const useLocalAppState = () => {
  const context = useContext(LocalAppStateContext);

  if (!context) {
    throw new Error('useLocalAppState must be used within LocalAppStateProvider');
  }

  return context;
};
