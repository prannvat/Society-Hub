import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Skeleton } from '@/components/Skeleton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { joinErrorMessage } from '@/services/api/memberships';
import { fetchSocietyMembers } from '@/services/api/societies';
import { PublicSocietyMember } from '@/services/api/types';
import { ScreenLayout } from './ScreenLayout';

const PAGE_SIZE = 30;

const ROLE_BADGE: Partial<Record<PublicSocietyMember['role'], { label: string; variant: 'primary' | 'neutral' }>> = {
  PRESIDENT: { label: 'President', variant: 'primary' },
  COMMITTEE: { label: 'Committee', variant: 'neutral' }
};

/** `course · year`, tolerating either half being missing. */
const memberCaption = (user: PublicSocietyMember['user']): string | null => {
  const parts = [user.course, user.year].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length > 0 ? parts.join(' · ') : null;
};

const MemberRowSkeleton = () => (
  <View style={styles.row}>
    <Skeleton circle height={44} />
    <View style={styles.rowText}>
      <Skeleton width="55%" height={15} />
      <Skeleton width="35%" height={12} />
    </View>
  </View>
);

/**
 * A society's public member list — its members are its followers, so this is
 * readable by any signed-in user. Doubles as a conversion surface: a viewer who
 * has not joined gets a sticky Join action under the people they are browsing.
 */
export const SocietyMembersScreen = () => {
  const theme = useAppTheme();
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocietyMembers'>>();
  const societyId = route.params.societyId;

  const { allSocieties, mySocietyIds, pendingMembershipSocietyIds, joinSociety } = useLocalAppState();
  const society = allSocieties.find((entry) => entry.id === societyId);

  const [members, setMembers] = useState<PublicSocietyMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const isMember = mySocietyIds.includes(societyId);
  const isPending = pendingMembershipSocietyIds.includes(societyId);
  const hasMore = members.length < total;

  const loadFirstPage = useCallback(async () => {
    setIsLoadingFirstPage(true);
    setHasError(false);
    try {
      const result = await fetchSocietyMembers(societyId, 1, PAGE_SIZE);
      setMembers(result.items);
      setTotal(result.total);
      setPage(1);
    } catch {
      setHasError(true);
      setMembers([]);
      setTotal(0);
    } finally {
      setIsLoadingFirstPage(false);
    }
  }, [societyId]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadNextPage = async () => {
    if (isLoadingFirstPage || isLoadingMore || hasError || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = await fetchSocietyMembers(societyId, nextPage, PAGE_SIZE);
      // Guard against duplicates if a member joined between page fetches.
      setMembers((prev) => {
        const seen = new Set(prev.map((entry) => entry.id));
        return [...prev, ...result.items.filter((entry) => !seen.has(entry.id))];
      });
      setTotal(result.total);
      setPage(nextPage);
    } catch {
      toast.show('Could not load more members. Please try again.', 'error');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleJoin = async () => {
    if (isJoining) {
      return;
    }
    setIsJoining(true);
    try {
      const result = await joinSociety(societyId);
      if (result === 'PENDING') {
        toast.show(`Request sent — ${society?.name ?? 'this society'} requires approval`, 'info');
      } else {
        toast.show(`Welcome to ${society?.name ?? 'the society'}!`, 'success');
        // The viewer is now on this list — reflect that without a manual refresh.
        loadFirstPage();
      }
    } catch (error) {
      toast.show(joinErrorMessage(error), 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const renderMember = ({ item }: { item: PublicSocietyMember }) => {
    const badge = ROLE_BADGE[item.role];
    const caption = memberCaption(item.user);

    return (
      <Pressable
        onPress={() => navigation.navigate('MemberProfile', { memberId: item.userId })}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.user.fullName}'s profile`}
        android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent' }
        ]}
      >
        <Avatar name={item.user.fullName} size={44} url={item.user.avatarUrl ?? undefined} />
        <View style={styles.rowText}>
          <View style={styles.nameRow}>
            <Text
              style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, flexShrink: 1 }]}
              numberOfLines={1}
            >
              {item.user.fullName}
            </Text>
            {item.user.isVerifiedStudent ? (
              <MaterialIcons name="verified" size={15} color={theme.colors.primary} />
            ) : null}
          </View>
          {caption ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </View>
        {badge ? <BadgeChip label={badge.label} variant={badge.variant} /> : null}
        <MaterialIcons name="chevron-right" size={22} color={theme.colors.textTertiary} />
      </Pressable>
    );
  };

  const memberCountLabel = total === 1 ? '1 member' : `${total} members`;

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.flex}>
        <TopNavBar
          title="Members"
          subtitle={society?.name ?? (isLoadingFirstPage ? undefined : memberCountLabel)}
          onBack={() => navigation.goBack()}
        />

        {isLoadingFirstPage ? (
          <View style={styles.skeletonWrap}>
            {Array.from({ length: 8 }).map((_, index) => (
              <MemberRowSkeleton key={index} />
            ))}
          </View>
        ) : hasError ? (
          <EmptyState
            icon="cloud-off"
            title="Couldn't load members"
            subtitle="Something went wrong fetching this society's members. Check your connection and try again."
            actionLabel="Try again"
            onAction={loadFirstPage}
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon="group-off"
            title="No members yet"
            subtitle={
              isMember
                ? 'This society has no members listed yet.'
                : 'Nobody has joined this society yet — you could be the first.'
            }
          />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderMember}
            contentContainerStyle={[styles.listContent, !isMember && !isPending ? styles.listContentWithCta : null]}
            showsVerticalScrollIndicator={false}
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.4}
            ListHeaderComponent={
              <Text style={[theme.typography.caption, styles.countLine, { color: theme.colors.textSecondary }]}>
                {memberCountLabel}
              </Text>
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : null
            }
          />
        )}

        {/* Browsing a society's people converts straight into joining it. */}
        {!isLoadingFirstPage && !hasError && !isMember ? (
          <View
            style={[
              styles.cta,
              theme.elevation.e2,
              { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }
            ]}
          >
            {isPending ? (
              <BadgeChip label="Membership pending approval" variant="warning" style={styles.ctaChip} />
            ) : (
              <PrimaryButton
                label={society ? `Join ${society.shortName}` : 'Join society'}
                icon="person-add"
                loading={isJoining}
                onPress={handleJoin}
              />
            )}
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  listContent: {
    paddingBottom: 32
  },
  listContentWithCta: {
    paddingBottom: 112
  },
  countLine: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  rowText: {
    flex: 1,
    gap: 2
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  skeletonWrap: {
    paddingTop: 12
  },
  footer: {
    paddingVertical: 20
  },
  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  ctaChip: {
    alignSelf: 'center'
  }
});
