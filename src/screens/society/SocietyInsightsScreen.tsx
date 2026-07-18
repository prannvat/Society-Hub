import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/Card';
import { EngagementCard, EngagementMetrics } from '@/components/EngagementCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ScreenLayout } from '../ScreenLayout';

/**
 * Society-account Insights: honest engagement derived only from data already
 * loaded for this society. No fabricated reach/impressions — every figure is a
 * real count, and captions state exactly what each one measures.
 */
export const SocietyInsightsScreen = () => {
  const theme = useAppTheme();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties, events, polls, announcements, activeSocietyMemberCount } = useLocalAppState();
  const society = allSocieties.find((s) => s.id === selectedAdminSocietyId);
  const brand = society?.primaryColor || theme.colors.primary;

  const metrics = useMemo<EngagementMetrics>(() => {
    const totalRsvps = events.reduce((sum, e) => sum + (e.attendingCount ?? 0), 0);
    const totalVotes = polls.reduce((sum, p) => sum + Object.keys(p.responses ?? {}).length, 0);
    const eventCount = events.length;
    const pollCount = polls.length;
    const avgRsvpsPerEvent = eventCount > 0 ? totalRsvps / eventCount : null;
    // Avg share of members voting per poll, bounded 0–100. Unmeasurable without members/polls.
    const pollTurnoutPct =
      pollCount > 0 && activeSocietyMemberCount > 0
        ? Math.min(100, (totalVotes / (pollCount * activeSocietyMemberCount)) * 100)
        : null;
    const top = events.reduce<(typeof events)[number] | null>(
      (best, e) => (!best || (e.attendingCount ?? 0) > (best.attendingCount ?? 0) ? e : best),
      null,
    );
    return {
      totalRsvps,
      totalVotes,
      eventCount,
      pollCount,
      memberCount: activeSocietyMemberCount,
      avgRsvpsPerEvent,
      pollTurnoutPct,
      topEvent: top && (top.attendingCount ?? 0) > 0 ? { title: top.title, count: top.attendingCount ?? 0 } : null,
    };
  }, [events, polls, activeSocietyMemberCount]);

  const publishedCount = announcements.length + events.length;

  return (
    <ScreenLayout>
      <ScreenHeader title="Insights" subtitle="How your community is engaging" />
      <View style={styles.body}>
        {/* Audience hero — honest framing: audience size = current members, not impressions. */}
        <Card style={[styles.hero, { borderColor: brand }]}>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.primarySoft }]}>
            <MaterialIcons name="groups" size={22} color={brand} />
          </View>
          <View style={styles.heroText}>
            <Text style={[theme.typography.display, { color: theme.colors.textPrimary }]}>{activeSocietyMemberCount}</Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
              {activeSocietyMemberCount === 1 ? 'member in your audience' : 'members in your audience'}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              Everything you publish reaches all {activeSocietyMemberCount}{' '}
              {activeSocietyMemberCount === 1 ? 'member' : 'members'} directly.
            </Text>
          </View>
        </Card>

        {/* Reach summary — counts of what's live for members to see. */}
        <View style={styles.row}>
          <View style={styles.cell}>
            <StatCard label="Published" value={String(publishedCount)} hint="posts + events live" icon="campaign" />
          </View>
          <View style={styles.cell}>
            <StatCard label="Polls run" value={String(polls.length)} hint="gathering opinions" icon="how-to-vote" />
          </View>
        </View>

        {/* Engagement panel — RSVPs, votes, averages, turnout, top event. All derived. */}
        <EngagementCard metrics={metrics} />

        <Text style={[theme.typography.caption, styles.footnote, { color: theme.colors.textTertiary }]}>
          Figures are counted from your society's own events, polls and members. We never estimate reach or impressions.
        </Text>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
  footnote: { marginTop: spacing.xs },
});
