import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { ProfileIdentityBlock } from '@/components/ProfileIdentityBlock';
import { ProfileLinkChips } from '@/components/ProfileLinkChips';
import { ProfileStatsRow } from '@/components/ProfileStatsRow';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { SocietyGrid, SocietyGridItem } from '@/components/SocietyGrid';
import { TopNavBar } from '@/components/TopNavBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import {
  PublicUserProfile,
  fetchUserByUsername,
  fetchUserProfile,
  isUserNotFound,
  profileErrorMessage,
} from '@/services/api/users';
import { spacing } from '@/config/theme';
import { ScreenLayout } from './ScreenLayout';

type UserProfileRoute = RouteProp<RootStackParamList, 'UserProfile'>;

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; profile: PublicUserProfile }
  | { status: 'notFound' }
  | { status: 'error'; message: string };

/**
 * Anyone else's profile. Same layout language as your own profile
 * (identity → links → stats → society grid), loaded by id or @handle.
 */
export const UserProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<UserProfileRoute>();
  const userId = route.params?.userId;
  const username = route.params?.username;

  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId && !username) {
      setState({ status: 'notFound' });
      return;
    }
    try {
      const profile = userId ? await fetchUserProfile(userId) : await fetchUserByUsername(username!);
      setState({ status: 'ready', profile });
    } catch (error) {
      if (isUserNotFound(error)) {
        setState({ status: 'notFound' });
        return;
      }
      setState({ status: 'error', message: profileErrorMessage(error) });
    }
  }, [userId, username]);

  useEffect(() => {
    setState({ status: 'loading' });
    void load();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  const profile = state.status === 'ready' ? state.profile : null;

  // Prefer the handle as the nav title — it's the stable identifier — and fall
  // back to the name so the bar is never empty while loading.
  const navTitle = profile
    ? profile.username
      ? `@${profile.username}`
      : profile.fullName
    : username
      ? `@${username}`
      : 'Profile';

  const societyItems: SocietyGridItem[] = (profile?.societies ?? []).map((society) => ({
    id: society.id,
    name: society.name,
    shortName: society.shortName,
    logoUrl: society.logoUrl,
    primaryColor: society.primaryColor,
    secondaryColor: society.secondaryColor,
    role: society.role,
  }));

  const caption = profile
    ? [profile.course, profile.year].filter(Boolean).join(' · ') || null
    : null;

  const firstName = profile?.fullName?.trim().split(/\s+/)[0] || 'They';

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title={navTitle} onBack={() => navigation.goBack()} />

      {state.status === 'loading' ? (
        <View style={styles.content}>
          <View style={styles.skeletonTop}>
            <Skeleton circle height={92} />
            <View style={styles.skeletonStats}>
              <Skeleton height={18} width="80%" />
              <Skeleton height={14} width="55%" />
            </View>
          </View>
          <Skeleton height={20} width="45%" />
          <Skeleton height={14} width="70%" />
          <Skeleton height={44} width="60%" radius={theme.radius.pill} />
          <SocietyGrid
            societies={[]}
            loading
            onPressSociety={() => undefined}
            emptyTitle=""
            emptySubtitle=""
          />
        </View>
      ) : null}

      {state.status === 'notFound' ? (
        <View style={styles.centered}>
          <EmptyState
            icon="person-off"
            title="User not found"
            subtitle="This profile doesn't exist, or the account has been removed."
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </View>
      ) : null}

      {state.status === 'error' ? (
        <View style={styles.centered}>
          <EmptyState
            icon="error-outline"
            title="Couldn't load this profile"
            subtitle={state.message}
            actionLabel="Try again"
            onAction={() => {
              setState({ status: 'loading' });
              void load();
            }}
          />
        </View>
      ) : null}

      {profile ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => { void handleRefresh(); }}
              tintColor={theme.colors.primary}
            />
          }
        >
          <ProfileIdentityBlock
            fullName={profile.fullName}
            username={profile.username}
            avatarUrl={profile.avatarUrl}
            bio={profile.bio}
            caption={caption}
            isVerifiedStudent={profile.isVerifiedStudent}
            trailing={
              <ProfileStatsRow
                stats={[
                  { label: profile.societies.length === 1 ? 'Society' : 'Societies', value: profile.societies.length },
                ]}
              />
            }
          />

          <ProfileLinkChips links={profile.links} />

          <View style={styles.section}>
            <SectionHeader title="Societies" />
            <SocietyGrid
              societies={societyItems}
              onPressSociety={(societyId) => navigation.navigate('SocietyProfile', { societyId })}
              emptyTitle="No societies yet"
              emptySubtitle={`${firstName} hasn't joined any societies on SocietyHub yet.`}
            />
          </View>
        </ScrollView>
      ) : null}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 96,
    gap: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  section: {
    gap: 12,
  },
  skeletonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skeletonStats: {
    flex: 1,
    gap: 8,
  },
});
