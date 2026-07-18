import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { ScreenLayout } from '../ScreenLayout';

/** Society-account Insights: honest engagement derived from loaded data. */
export const SocietyInsightsScreen = () => {
  const theme = useAppTheme();
  const { events, polls, announcements, activeSocietyMemberCount } = useLocalAppState();

  const totalRsvps = events.reduce((sum, e) => sum + (e.attendingCount ?? 0), 0);
  const totalVotes = polls.reduce((sum, p) => sum + Object.keys(p.responses ?? {}).length, 0);
  const avgRsvps = events.length > 0 ? Math.round(totalRsvps / events.length) : 0;
  const topEvent = events.reduce<(typeof events)[number] | null>(
    (best, e) => (!best || (e.attendingCount ?? 0) > (best.attendingCount ?? 0) ? e : best),
    null,
  );

  return (
    <ScreenLayout>
      <ScreenHeader title="Insights" subtitle="How your community is engaging" />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.cell}><StatCard label="Members" value={String(activeSocietyMemberCount)} icon="group" /></View>
          <View style={styles.cell}><StatCard label="Total RSVPs" value={String(totalRsvps)} hint={`across ${events.length} events`} icon="event-available" /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}><StatCard label="Total votes" value={String(totalVotes)} hint={`across ${polls.length} polls`} icon="how-to-vote" /></View>
          <View style={styles.cell}><StatCard label="Avg RSVPs / event" value={String(avgRsvps)} icon="trending-up" /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}><StatCard label="Posts" value={String(announcements.length)} icon="campaign" /></View>
          <View style={styles.cell}><StatCard label="Events" value={String(events.length)} icon="event" /></View>
        </View>

        {topEvent && (topEvent.attendingCount ?? 0) > 0 ? (
          <Card>
            <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>MOST-ATTENDED EVENT</Text>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 4 }]}>{topEvent.title}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{topEvent.attendingCount} going</Text>
          </Card>
        ) : null}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
});
