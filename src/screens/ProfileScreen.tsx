import React from 'react';
import { Alert, Pressable, Share, Text, View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { SectionHeader } from '@/components/SectionHeader';
import { CampusPointsCard } from '@/components/CampusPointsCard';
import { BadgeRow } from '@/components/BadgeRow';
import { ProfileStatsRow } from '@/components/ProfileStatsRow';
import { ProfileIdentityBlock } from '@/components/ProfileIdentityBlock';
import { ProfileLinkChips } from '@/components/ProfileLinkChips';
import { SocietyGrid, SocietyGridItem } from '@/components/SocietyGrid';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAccountSwitcher } from '@/hooks/useAccountSwitcher';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { ScreenHeader } from '@/components/ScreenHeader';
import { RootStackParamList } from '@/navigation/types';
import { MemberRole } from '@/types';
import { spacing } from '@/config/theme';
import { computeCampusProgress, CampusBadge } from '@/utils/campusPoints';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    mySocietyIds,
    pendingMembershipSocietyIds,
    allSocieties,
    profile,
    rsvpedEventIds,
    exploreEvents,
    polls,
    currentUserId,
  } = useLocalAppState();
  const toast = useToast();
  const {
    adminSocieties,
    switchToSociety,
  } = useUserRoles();
  const { user, signOut } = useAuth();
  const { openSwitcher } = useAccountSwitcher();

  // Events the user has RSVPed across all loaded events (deduplicated by id).
  const eventsAttended = new Set([
    ...rsvpedEventIds,
    ...exploreEvents.filter((event) => event.isRsvpedByCurrentUser).map((event) => event.id),
  ]).size;

  // Campus Points — derived honestly from real activity. pollsVoted counts loaded
  // polls the current user has actually voted in; only the active society's polls are
  // loaded into state, so this can under-count across other societies. That's an
  // acceptable, truthful floor — never inflated.
  const pollsVoted = polls.filter((poll) => Boolean(poll.responses[currentUserId])).length;
  const campusProgress = computeCampusProgress({
    societiesJoined: mySocietyIds.length,
    eventsRsvped: eventsAttended,
    pollsVoted,
  });

  const handleBadgePress = (badge: CampusBadge) => {
    if (badge.earned) {
      toast.show(`${badge.label} unlocked`, 'success');
    } else {
      toast.show(`${badge.label}: ${badge.hint}`, 'info');
    }
  };

  const identityCaption = [profile.university, profile.course, profile.year].filter(Boolean).join(' • ');

  // The real, stored handle — `user` is the API source of truth for it.
  const username = user?.username ?? null;
  const handle = username ? `@${username}` : '@you';
  const links = user?.links ?? [];

  // The committee/president role the user holds in a given society, if any.
  const roleForSociety = (societyId: string): MemberRole | undefined =>
    adminSocieties.find((relationship) => relationship.societyId === societyId)?.role;

  // Societies the user has actually joined, resolved against the loaded catalogue.
  const joinedSocieties = mySocietyIds
    .map((id) => allSocieties.find((society) => society.id === id))
    .filter((society): society is NonNullable<typeof society> => society !== undefined);

  const pendingSocieties = pendingMembershipSocietyIds
    .map((id) => allSocieties.find((society) => society.id === id))
    .filter((society): society is NonNullable<typeof society> => society !== undefined);

  // Joined societies first, then pending ones (muted) — one grid, one story.
  const societyGridItems: SocietyGridItem[] = [
    ...joinedSocieties.map((society) => {
      const role = roleForSociety(society.id);
      return {
        id: society.id,
        name: society.name,
        shortName: society.shortName,
        logoUrl: society.logoUrl,
        primaryColor: society.primaryColor,
        secondaryColor: society.secondaryColor,
        role: role === 'President' ? ('PRESIDENT' as const) : role === 'Committee' ? ('COMMITTEE' as const) : undefined,
      };
    }),
    ...pendingSocieties.map((society) => ({
      id: society.id,
      name: society.name,
      shortName: society.shortName,
      logoUrl: society.logoUrl,
      primaryColor: society.primaryColor,
      secondaryColor: society.secondaryColor,
      pending: true,
    })),
  ];

  const handleShareProfile = async () => {
    const societyCount = mySocietyIds.length;
    await Share.share({
      message: `${profile.fullName} is on SocietyHub — member of ${societyCount} ${societyCount === 1 ? 'society' : 'societies'}. Join your university community on SocietyHub!`,
    });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  return (
    <ScreenLayout scroll={false}>
      <ScreenHeader
        title="Profile"
        accessory={
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={10}
            style={({ pressed }) => [styles.headerAction, { opacity: pressed ? 0.5 : 1 }]}
          >
            <MaterialIcons name="settings" size={24} color={theme.colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* IG-style account bar — tapping your name opens the account switcher */}
        <Pressable
          onPress={openSwitcher}
          hitSlop={8}
          style={({ pressed }) => [styles.accountBar, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
            {handle}
          </Text>
          <MaterialIcons name="expand-more" size={22} color={theme.colors.textPrimary} />
        </Pressable>

        {/* Identity — the same block anyone else's profile uses. The handle is
            omitted here because the account bar directly above already shows it. */}
        <ProfileIdentityBlock
          fullName={profile.fullName || 'Your name'}
          avatarUrl={profile.avatarUrl}
          bio={profile.bio}
          caption={identityCaption || null}
          isVerifiedStudent={profile.isVerifiedStudent}
          trailing={
            <ProfileStatsRow
              stats={[
                { label: 'Societies', value: mySocietyIds.length },
                { label: 'Events', value: eventsAttended },
                { label: 'Points', value: campusProgress.points }
              ]}
            />
          }
        />

        {profile.isVerifiedStudent ? (
          <View style={styles.chipRow}>
            <BadgeChip label="Verified Student" variant="success" />
          </View>
        ) : null}

        {/* Socials — tappable chips, the same component other profiles use */}
        <ProfileLinkChips links={links} />

        {links.length === 0 ? (
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            style={({ pressed }) => [
              styles.addLinksHint,
              {
                borderColor: theme.colors.borderStrong,
                borderRadius: theme.radius.pill,
                backgroundColor: pressed ? theme.colors.primarySoft : 'transparent'
              }
            ]}
          >
            <MaterialIcons name="add-link" size={18} color={theme.colors.primary} />
            <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>
              Add your Instagram, Snapchat and more
            </Text>
          </Pressable>
        ) : null}

        {/* IG action buttons */}
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Edit profile"
              variant="secondary"
              size="md"
              icon="edit"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Share"
              variant="secondary"
              size="md"
              icon="ios-share"
              onPress={handleShareProfile}
            />
          </View>
        </View>

        {/* Campus Points — rewards / gamification, derived from real activity */}
        <View style={styles.rewards}>
          <CampusPointsCard progress={campusProgress} />
          <BadgeRow badges={campusProgress.badges} onPressBadge={handleBadgePress} />
        </View>

        {/* Your societies — the grid is the visual anchor of the profile */}
        <View style={styles.section}>
          <SectionHeader title="Your societies" />
          <SocietyGrid
            societies={societyGridItems}
            onPressSociety={(societyId) => navigation.navigate('SocietyProfile', { societyId })}
            emptyTitle="No societies yet"
            emptySubtitle="Discover and join societies at your university to see them here."
            emptyActionLabel="Explore societies"
            onEmptyAction={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
          />
        </View>

        {/* Switch account — committee members act AS their societies (IG-style) */}
        {adminSocieties.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Switch to a society account" />
            <Card padding={0}>
              {adminSocieties.map((relationship, index) => (
                <React.Fragment key={relationship.societyId}>
                  {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} /> : null}
                  <ListRow
                    title={relationship.societyName}
                    subtitle={`Manage as ${relationship.role} — post, insights, members`}
                    leading={<Avatar name={relationship.societyName} size={40} />}
                    trailing={<BadgeChip label="Switch" variant="primary" />}
                    chevron
                    onPress={() => switchToSociety(relationship.societyId)}
                  />
                </React.Fragment>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Account actions */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <Card padding={0}>
            <ListRow
              title="Edit profile"
              subtitle="Name, bio, academics, and links"
              leading={<MaterialIcons name="edit" size={22} color={theme.colors.primary} />}
              chevron
              onPress={() => navigation.navigate('EditProfile')}
            />
            <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
            <ListRow
              title="Settings"
              subtitle="Notifications, appearance, account"
              leading={<MaterialIcons name="settings" size={22} color={theme.colors.primary} />}
              chevron
              onPress={() => navigation.navigate('Settings')}
            />
          </Card>
        </View>

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOut,
            {
              borderRadius: theme.radius.pill,
              backgroundColor: pressed ? theme.colors.dangerSoft : 'transparent'
            }
          ]}
        >
          <MaterialIcons name="logout" size={18} color={theme.colors.danger} />
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.danger }]}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 96,
    gap: 18
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  accountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    minHeight: 32
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  rewards: {
    gap: 14
  },
  addLinksHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed'
  },
  section: {
    gap: 12
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50
  },
  consoleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    marginTop: 4
  }
});
