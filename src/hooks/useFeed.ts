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
  | { kind: 'post'; id: string; society: FeedSociety; createdAtIso: string; title: string; preview: string; body?: string; category: AnnouncementCategory }
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
    society: feedSociety,
    createdAtIso: a.createdAt,
    title: a.title,
    preview: a.preview,
    body: a.body ?? undefined,
    category: mapAnnouncementCategory(a.category),
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
