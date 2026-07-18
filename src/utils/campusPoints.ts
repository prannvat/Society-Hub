/**
 * Campus Points — the student rewards layer. Points are DERIVED deterministically
 * from the user's real activity (no fabricated numbers, no server state needed):
 * every society joined, event RSVP'd, and poll voted earns a fixed amount.
 */

export const POINTS = {
  joinSociety: 25,
  rsvpEvent: 15,
  votePoll: 5,
} as const;

export type CampusBadge = {
  id: string;
  label: string;
  icon: string; // MaterialIcons name
  earned: boolean;
  hint: string;
};

export type CampusProgress = {
  points: number;
  level: number;
  levelTitle: string;
  /** Points into the current level and how many span it, for a progress bar. */
  intoLevel: number;
  levelSpan: number;
  pointsToNextLevel: number;
  badges: CampusBadge[];
};

const LEVEL_TITLES = ['Fresher', 'Regular', 'Insider', 'Fixture', 'Legend'];
const LEVEL_SPAN = 100; // points per level

export type CampusActivity = {
  societiesJoined: number;
  eventsRsvped: number;
  pollsVoted: number;
};

export function computeCampusProgress(activity: CampusActivity): CampusProgress {
  const points =
    activity.societiesJoined * POINTS.joinSociety +
    activity.eventsRsvped * POINTS.rsvpEvent +
    activity.pollsVoted * POINTS.votePoll;

  const levelIndex = Math.min(Math.floor(points / LEVEL_SPAN), LEVEL_TITLES.length - 1);
  const level = levelIndex + 1;
  const intoLevel = levelIndex >= LEVEL_TITLES.length - 1 ? LEVEL_SPAN : points % LEVEL_SPAN;
  const pointsToNextLevel = levelIndex >= LEVEL_TITLES.length - 1 ? 0 : LEVEL_SPAN - intoLevel;

  const badges: CampusBadge[] = [
    { id: 'joiner', label: 'Joiner', icon: 'group-add', earned: activity.societiesJoined >= 1, hint: 'Join a society' },
    { id: 'social', label: 'Social', icon: 'diversity-3', earned: activity.societiesJoined >= 3, hint: 'Join 3 societies' },
    { id: 'goer', label: 'Event-goer', icon: 'event-available', earned: activity.eventsRsvped >= 1, hint: 'RSVP to an event' },
    { id: 'regular', label: 'Regular', icon: 'local-fire-department', earned: activity.eventsRsvped >= 5, hint: 'RSVP to 5 events' },
    { id: 'voice', label: 'Voice', icon: 'how-to-vote', earned: activity.pollsVoted >= 1, hint: 'Vote in a poll' },
  ];

  return {
    points,
    level,
    levelTitle: LEVEL_TITLES[levelIndex],
    intoLevel,
    levelSpan: LEVEL_SPAN,
    pointsToNextLevel,
    badges,
  };
}
