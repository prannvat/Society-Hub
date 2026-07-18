import { useCallback, useEffect, useState } from 'react';
import { fetchAnnouncements } from '@/services/api/announcements';
import { fetchEvents } from '@/services/api/events';
import { fetchPolls } from '@/services/api/polls';
import { mapApiEvent } from '@/utils/mapApiEvent';
import { AnnouncementCategory, EventItem, SocietyItem } from '@/types';
import { mapAnnouncementCategory } from '@/utils/mapAnnouncementCategory';

/** Feed-native poll shape — keeps the API's vote counts (the UI PollItem is lossy). */
export type FeedPoll = {
  id: string;
  societyId: string;
  question: string;
  options: { id: string; label: string; count: number; percentage: number }[];
  totalVotes: number;
  currentUserVote: string | null;
};

/**
 * A single item in the Home feed. The feed aggregates posts, events, and polls
 * across every society the user has joined, newest first — the Instagram-style
 * home experience.
 */
export type FeedItem =
  | { kind: 'post'; id: string; postId: string; society: FeedSociety; createdAtIso: string; title: string; preview: string; body?: string; category: AnnouncementCategory; likeCount: number; commentCount: number; likedByMe: boolean }
  | { kind: 'event'; id: string; society: FeedSociety; createdAtIso: string; event: EventItem }
  | { kind: 'poll'; id: string; society: FeedSociety; createdAtIso: string; poll: FeedPoll };

export type FeedSociety = {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
};

/**
 * Compact, Instagram-style relative time for feed items.
 * Just now · Nm · Nh · Yesterday · Nd · then an absolute date.
 * Shared by the three feed cards so timestamps read identically.
 */
export function formatRelativeTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60000) {
    return 'Just now';
  }
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDay = new Date(parsed);
  startOfDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startOfToday.getTime() - startOfDay.getTime()) / 86400000);
  if (dayDiff <= 0) {
    return `${Math.floor(minutes / 60)}h`;
  }
  if (dayDiff === 1) {
    return 'Yesterday';
  }
  if (dayDiff < 7) {
    return `${dayDiff}d`;
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const toFeedSociety = (society: SocietyItem): FeedSociety => ({
  id: society.id,
  name: society.name,
  shortName: society.shortName,
  logoUrl: society.logoUrl ?? null,
  primaryColor: society.primaryColor,
  secondaryColor: society.secondaryColor,
});

async function loadSocietyFeed(society: SocietyItem): Promise<FeedItem[]> {
  const feedSociety = toFeedSociety(society);
  const [announcements, events, polls] = await Promise.all([
    fetchAnnouncements(society.id).catch(() => []),
    fetchEvents(society.id).catch(() => []),
    fetchPolls(society.id).catch(() => []),
  ]);

  const postItems: FeedItem[] = announcements.map((a) => ({
    kind: 'post',
    id: `post_${a.id}`,
    postId: a.id,
    society: feedSociety,
    createdAtIso: a.createdAt,
    title: a.title,
    preview: a.preview,
    body: a.body ?? undefined,
    category: mapAnnouncementCategory(a.category),
    likeCount: a.likeCount ?? 0,
    commentCount: a.commentCount ?? 0,
    likedByMe: a.likedByCurrentUser ?? false,
  }));

  const eventItems: FeedItem[] = events.map((e) => ({
    kind: 'event',
    id: `event_${e.id}`,
    society: feedSociety,
    createdAtIso: e.createdAt ?? e.startAt,
    event: { ...mapApiEvent(e), societyName: society.name },
  }));

  const pollItems: FeedItem[] = polls.map((p) => ({
    kind: 'poll',
    id: `poll_${p.id}`,
    society: feedSociety,
    createdAtIso: p.createdAt,
    poll: {
      id: p.id,
      societyId: p.societyId,
      question: p.question,
      options: p.options.map((o) => ({ id: o.id, label: o.label, count: o.count, percentage: o.percentage })),
      totalVotes: p.totalVotes,
      currentUserVote: p.currentUserVote,
    },
  }));

  return [...postItems, ...eventItems, ...pollItems];
}

/**
 * Aggregates a Home feed from the societies the user belongs to. Derived, on-demand
 * state living outside the app-state god-context so it stays isolated and testable.
 */
export function useFeed(societies: SocietyItem[], mySocietyIds: string[]) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const joined = societies.filter((s) => mySocietyIds.includes(s.id));
  const joinedKey = joined.map((s) => s.id).sort().join(',');

  const refresh = useCallback(async () => {
    if (joined.length === 0) {
      setItems([]);
      setHasLoaded(true);
      return;
    }
    setIsLoading(true);
    try {
      const perSociety = await Promise.all(joined.map(loadSocietyFeed));
      const merged = perSociety
        .flat()
        .sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());
      setItems(merged);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
    // joinedKey captures membership identity; loadSocietyFeed is module-level.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinedKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, isLoading, hasLoaded, refresh, joinedSocieties: joined };
}
