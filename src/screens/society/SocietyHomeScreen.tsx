import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { AnnouncementItem, EventItem, PollItem } from '@/types';
import { ScreenLayout } from '../ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['All', 'Posts', 'Events', 'Polls'] as const;
type Filter = (typeof FILTERS)[number];

type FeedRow =
  | { kind: 'post'; id: string; item: AnnouncementItem }
  | { kind: 'event'; id: string; item: EventItem }
  | { kind: 'poll'; id: string; item: PollItem };

/** Society-account Home: the society's own published content, with a create prompt. */
export const SocietyHomeScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties, announcements, events, polls, refreshActiveSociety } = useLocalAppState();
  const societyId = selectedAdminSocietyId ?? '';
  const society = allSocieties.find((s) => s.id === societyId);
  const brand = society?.primaryColor || theme.colors.primary;

  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshActiveSociety();
      if (!cancelled) setInitialLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshActiveSociety]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshActiveSociety();
    } finally {
      setRefreshing(false);
    }
  }, [refreshActiveSociety]);

  const feed = useMemo<FeedRow[]>(() => {
    const posts: FeedRow[] = announcements.map((a) => ({ kind: 'post', id: `p_${a.id}`, item: a }));
    const evts: FeedRow[] = events.map((e) => ({ kind: 'event', id: `e_${e.id}`, item: e }));
    const pls: FeedRow[] = polls.map((p) => ({ kind: 'poll', id: `q_${p.id}`, item: p }));
    if (filter === 'Posts') return posts;
    if (filter === 'Events') return evts;
    if (filter === 'Polls') return pls;
    return [...posts, ...evts, ...pls];
  }, [announcements, events, polls, filter]);

  const composer = (
    <View>
      <Card style={styles.composerCard}>
        <Pressable
          onPress={() => navigation.navigate('CreatePost', { societyId })}
          style={({ pressed }) => [styles.composer, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Share an update"
        >
          <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={40} />
          <View style={[styles.composerInput, { backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.pill }]}>
            <Text style={[theme.typography.body, { color: theme.colors.textTertiary }]}>Share an update…</Text>
          </View>
        </Pressable>
        <View style={[styles.quickRow, { borderTopColor: theme.colors.border }]}>
          {([
            { icon: 'campaign', label: 'Post', screen: 'CreatePost' },
            { icon: 'event', label: 'Event', screen: 'CreateEvent' },
            { icon: 'how-to-vote', label: 'Poll', screen: 'CreatePoll' },
          ] as const).map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.screen, { societyId })}
              style={({ pressed }) => [styles.quick, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={`Create ${q.label}`}
            >
              <MaterialIcons name={q.icon} size={20} color={brand} />
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.filterWrap}>
        <SegmentedControl segments={FILTERS} value={filter} onChange={setFilter} accent={brand} />
      </View>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedRow }) => {
      if (item.kind === 'post') {
        return (
          <View style={styles.rowGap}>
            <AnnouncementCard item={item.item} onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.item.id })} />
          </View>
        );
      }
      if (item.kind === 'event') {
        return (
          <View style={styles.rowGap}>
            <EventCard event={item.item} onPressRSVP={() => navigation.navigate('EventDetail', { eventId: item.item.id })} />
          </View>
        );
      }
      return (
        <View style={styles.rowGap}>
          <PollSummaryCard poll={item.item} accent={brand} onPress={() => navigation.navigate('SocietyPolls', { societyId })} />
        </View>
      );
    },
    [navigation, societyId, brand],
  );

  const emptyCopy: Record<Filter, { title: string; subtitle: string }> = {
    All: { title: 'Publish your first post', subtitle: 'Share an update, event, or poll to reach every member of your society.' },
    Posts: { title: 'No posts yet', subtitle: 'Announcements you publish show up here for your members.' },
    Events: { title: 'No events yet', subtitle: 'Create an event to start collecting RSVPs from members.' },
    Polls: { title: 'No polls yet', subtitle: 'Run a poll to hear what your members think.' },
  };

  return (
    <ScreenLayout scroll={false}>
      {initialLoading ? (
        <View style={styles.list}>
          {composer}
          {[0, 1, 2].map((i) => (
            <Card key={i} style={styles.rowGap}>
              <Skeleton width={90} height={22} radius={theme.radius.pill} />
              <Skeleton width="80%" height={18} style={{ marginTop: 12 }} />
              <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
            </Card>
          ))}
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ListHeaderComponent={composer}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand} colors={[brand]} />}
          ListEmptyComponent={
            <EmptyState
              icon="post-add"
              title={emptyCopy[filter].title}
              subtitle={emptyCopy[filter].subtitle}
              actionLabel="Create"
              onAction={() => navigation.navigate('CreateHub', { societyId })}
            />
          }
        />
      )}
    </ScreenLayout>
  );
};

/** Lightweight, read-only summary of one of the society's polls (voting lives on SocietyPolls). */
const PollSummaryCard = ({ poll, accent, onPress }: { poll: PollItem; accent: string; onPress: () => void }) => {
  const theme = useAppTheme();
  const totalVotes = Object.keys(poll.responses ?? {}).length;
  return (
    <Card onPress={onPress}>
      <View style={styles.pollHeader}>
        <View style={[styles.pollIcon, { backgroundColor: theme.colors.primarySoft }]}>
          <MaterialIcons name="how-to-vote" size={16} color={accent} />
        </View>
        <Text style={[theme.typography.micro, { color: theme.colors.textTertiary, flex: 1 }]}>POLL</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
      </View>
      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 8 }]} numberOfLines={2}>
        {poll.question}
      </Text>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 6 }]}>
        {poll.options.length} options · Tap to view results
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  composerCard: { padding: 0, overflow: 'hidden' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  composerInput: { flex: 1, minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.md },
  quickRow: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  quick: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48 },
  filterWrap: { marginTop: spacing.md, marginBottom: spacing.sm },
  rowGap: { marginBottom: spacing.md },
  pollHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pollIcon: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
