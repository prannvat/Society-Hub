import React, { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { PostFeedCard } from '@/components/PostFeedCard';
import { EventFeedCard } from '@/components/EventFeedCard';
import { PollFeedCard } from '@/components/PollFeedCard';
import { SocietyStoryRow } from '@/components/SocietyStoryRow';
import { EmptyState } from '@/components/EmptyState';
import { NotificationBell } from '@/components/NotificationBell';
import { Skeleton } from '@/components/Skeleton';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/components/Toast';
import { FeedItem, useFeed } from '@/hooks/useFeed';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { allSocieties, mySocietyIds, setActiveSocietyId, rsvpedEventIds, toggleRSVP, voteOnPoll } = useLocalAppState();
  const { adminSocieties } = useUserRoles();
  const toast = useToast();
  const { items, isLoading, hasLoaded, refresh, joinedSocieties } = useFeed(allSocieties, mySocietyIds);

  const canCreate = adminSocieties.length > 0;

  const openSociety = useCallback(
    (societyId: string) => {
      setActiveSocietyId(societyId);
      navigation.navigate('SocietyProfile', { societyId });
    },
    [navigation, setActiveSocietyId],
  );

  const handleRSVP = useCallback(
    async (eventId: string, wasGoing: boolean) => {
      try {
        await toggleRSVP(eventId);
        toast.show(wasGoing ? 'RSVP removed' : "You're going!", wasGoing ? 'info' : 'success');
      } catch {
        toast.show('Could not update your RSVP', 'error');
        throw new Error('rsvp-failed');
      }
    },
    [toggleRSVP, toast],
  );

  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      try {
        await voteOnPoll(pollId, optionId);
        await refresh();
        toast.show('Vote counted', 'success');
      } catch {
        toast.show('Could not record your vote', 'error');
        throw new Error('vote-failed');
      }
    },
    [voteOnPoll, refresh, toast],
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.kind === 'post') {
        return (
          <PostFeedCard
            society={item.society}
            createdAtIso={item.createdAtIso}
            title={item.title}
            preview={item.preview}
            body={item.body}
            imageUrl={item.imageUrl}
            category={item.category}
            postId={item.postId}
            likeCount={item.likeCount}
            commentCount={item.commentCount}
            likedByMe={item.likedByMe}
            onOpenSociety={() => openSociety(item.society.id)}
            onReadMore={() => navigation.navigate('AnnouncementDetail', { announcementId: item.postId })}
          />
        );
      }
      if (item.kind === 'event') {
        const isGoing = rsvpedEventIds.includes(item.event.id);
        return (
          <EventFeedCard
            society={item.society}
            createdAtIso={item.createdAtIso}
            event={item.event}
            isGoing={isGoing}
            onOpenSociety={() => openSociety(item.society.id)}
            onOpenDetail={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
            onToggleRSVP={() => handleRSVP(item.event.id, isGoing)}
          />
        );
      }
      return (
        <PollFeedCard
          society={item.society}
          createdAtIso={item.createdAtIso}
          poll={item.poll}
          onOpenSociety={() => openSociety(item.society.id)}
          onVote={(optionId) => handleVote(item.poll.id, optionId)}
        />
      );
    },
    [openSociety, navigation, rsvpedEventIds, handleRSVP, handleVote],
  );

  const storyRow = <SocietyStoryRow societies={joinedSocieties} onPressSociety={openSociety} />;

  return (
    <ScreenLayout scroll={false}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.wordmark, theme.typography.h1, { color: theme.colors.textPrimary }]}>SocietyHub</Text>
        <View style={styles.headerActions}>
          {canCreate ? (
            <Pressable
              onPress={() => navigation.navigate('CreateHub', undefined)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Create a post, event or poll"
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
            >
              <MaterialIcons name="add-box" size={26} color={theme.colors.textPrimary} />
            </Pressable>
          ) : null}
          <NotificationBell />
        </View>
      </View>

      {isLoading && !hasLoaded ? (
        <View>
          {storyRow}
          <View style={styles.skeletonWrap}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonHeader}>
                  <Skeleton width={40} height={40} circle />
                  <View style={{ gap: 6 }}>
                    <Skeleton width={130} height={14} />
                    <Skeleton width={70} height={11} />
                  </View>
                </View>
                <Skeleton width="80%" height={18} />
                <Skeleton width="100%" height={40} />
              </View>
            ))}
          </View>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          {storyRow}
          <EmptyState
            icon="dynamic-feed"
            title="Your campus feed"
            subtitle="Posts, events, and polls from societies you join — like, comment, RSVP and vote to get involved."
            actionLabel="Explore societies"
            onAction={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={storyRow}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          windowSize={7}
          initialNumToRender={6}
          removeClippedSubviews
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
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  wordmark: { letterSpacing: -0.5 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: spacing.xxl },
  skeletonWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  skeletonCard: { gap: spacing.sm },
  skeletonHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xs },
  emptyWrap: { paddingTop: spacing.sm }
});
