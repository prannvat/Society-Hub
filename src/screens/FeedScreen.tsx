import React, { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { BadgeChip } from '@/components/BadgeChip';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { FeedItem, useFeed } from '@/hooks/useFeed';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { allSocieties, mySocietyIds, setActiveSocietyId, rsvpedEventIds } = useLocalAppState();
  const { adminSocieties } = useUserRoles();
  const { items, isLoading, hasLoaded, refresh, joinedSocieties } = useFeed(allSocieties, mySocietyIds);

  const canCreate = adminSocieties.length > 0;

  const openSociety = useCallback(
    (societyId: string) => {
      setActiveSocietyId(societyId);
      navigation.navigate('SocietyProfile', { societyId });
    },
    [navigation, setActiveSocietyId],
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      const header = (
        <Pressable style={styles.cardHeader} onPress={() => openSociety(item.society.id)}>
          <Avatar name={item.society.name} url={item.society.logoUrl ?? undefined} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {item.society.name}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {item.kind === 'post' ? 'Update' : item.kind === 'event' ? 'Event' : 'Poll'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={theme.colors.textTertiary} />
        </Pressable>
      );

      return (
        <View style={styles.feedBlock}>
          {header}
          {item.kind === 'post' ? (
            <AnnouncementCard
              item={{
                id: item.id,
                title: item.title,
                preview: item.preview,
                body: item.body,
                category: item.category,
                authorName: item.society.name,
                timestamp: item.createdAtIso,
                readCount: 0,
              }}
              onPress={() => openSociety(item.society.id)}
            />
          ) : item.kind === 'event' ? (
            <EventCard
              event={{ ...item.event, isRsvpedByCurrentUser: rsvpedEventIds.includes(item.event.id) }}
              onPressRSVP={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
            />
          ) : (
            <Card onPress={() => openSociety(item.society.id)}>
              <BadgeChip label="Poll" variant="primary" />
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: spacing.sm }]}>
                {item.poll.question}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                {item.poll.totalVotes} {item.poll.totalVotes === 1 ? 'vote' : 'votes'} · Tap to vote
              </Text>
            </Card>
          )}
        </View>
      );
    },
    [theme, openSociety, navigation, rsvpedEventIds],
  );

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.header}>
        <Text style={[theme.typography.display, { color: theme.colors.textPrimary }]}>SocietyHub</Text>
        <View style={styles.headerActions}>
          {canCreate ? (
            <Pressable
              onPress={() => navigation.navigate('CreateHub', undefined)}
              hitSlop={10}
              style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="add" size={24} color={theme.colors.textOnPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {joinedSocieties.length > 0 ? (
        <View style={styles.storyRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={joinedSocieties}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
            renderItem={({ item }) => (
              <Pressable style={styles.story} onPress={() => openSociety(item.id)}>
                <Avatar name={item.name} url={item.logoUrl ?? undefined} size={56} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, maxWidth: 64 }]} numberOfLines={1}>
                  {item.shortName || item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      {isLoading && !hasLoaded ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg, paddingTop: spacing.md }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ gap: spacing.sm }}>
              <Skeleton width={160} height={20} />
              <Skeleton width="100%" height={120} radius={theme.radius.card} />
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="dynamic-feed"
          title="Your feed is empty"
          subtitle="Join societies to see their posts, events, and polls here."
          actionLabel="Explore societies"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={theme.colors.primary} />}
        />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  storyRow: { paddingVertical: spacing.sm },
  story: { alignItems: 'center', gap: 4, width: 64 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  feedBlock: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
