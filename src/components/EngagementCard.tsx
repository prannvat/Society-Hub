import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { InsightStat } from './InsightStat';
import { useAppTheme } from '@/hooks/useAppTheme';

export type EngagementMetrics = {
  /** Sum of every event's attending/RSVP count. */
  totalRsvps: number;
  /** Sum of votes cast across all polls. */
  totalVotes: number;
  eventCount: number;
  pollCount: number;
  memberCount: number;
  /** Mean RSVPs per event — null when there are no events yet. */
  avgRsvpsPerEvent: number | null;
  /** Mean share of members voting per poll (0–100) — null when unmeasurable. */
  pollTurnoutPct: number | null;
  /** Most-attended event, if any event has at least one RSVP. */
  topEvent: { title: string; count: number } | null;
};

/**
 * Society-facing engagement panel. Every figure is derived from data already
 * loaded for this society (events, polls, members) — we never fabricate reach
 * or impression numbers we don't track. Captions state exactly what's counted.
 */
export const EngagementCard = ({ metrics }: { metrics: EngagementMetrics }) => {
  const theme = useAppTheme();

  const { totalRsvps, totalVotes, eventCount, pollCount, avgRsvpsPerEvent, pollTurnoutPct, topEvent } = metrics;
  const hasEngagement = totalRsvps > 0 || totalVotes > 0;

  return (
    <Card>
      <View style={styles.header}>
        <View
          style={[styles.headerIcon, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm }]}
        >
          <MaterialIcons name="insights" size={16} color={theme.colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Engagement</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            How members respond to what you post
          </Text>
        </View>
      </View>

      {hasEngagement ? (
        <>
          <View style={styles.grid}>
            <View style={styles.row}>
              <InsightStat
                icon="event-available"
                value={String(totalRsvps)}
                label="RSVPs"
                caption={`across ${eventCount} ${eventCount === 1 ? 'event' : 'events'}`}
              />
              <InsightStat
                icon="how-to-vote"
                value={String(totalVotes)}
                label="Votes"
                caption={`across ${pollCount} ${pollCount === 1 ? 'poll' : 'polls'}`}
              />
            </View>
            <View style={styles.row}>
              <InsightStat
                icon="groups"
                value={avgRsvpsPerEvent === null ? '—' : avgRsvpsPerEvent.toFixed(1)}
                label="Avg per event"
                caption={avgRsvpsPerEvent === null ? 'no events yet' : 'RSVPs per event'}
              />
              <InsightStat
                icon="poll"
                value={pollTurnoutPct === null ? '—' : `${Math.round(pollTurnoutPct)}%`}
                label="Poll turnout"
                caption={pollTurnoutPct === null ? 'no polls yet' : 'of members vote, per poll'}
              />
            </View>
          </View>

          {topEvent ? (
            <View style={[styles.insightRow, { borderTopColor: theme.colors.border }]}>
              <MaterialIcons name="local-fire-department" size={16} color={theme.colors.accent} />
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={2}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Most-attended: </Text>
                {topEvent.title} ({topEvent.count} going)
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.emptyRow}>
          <MaterialIcons name="insights" size={18} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]}>
            No RSVPs or votes yet. Post an event or run a poll — responses show up here.
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  headerIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
