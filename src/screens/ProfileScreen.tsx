import React from 'react';
import { Alert, Pressable, Share, Text, View, Linking, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { CampusPointsCard } from '@/components/CampusPointsCard';
import { BadgeRow } from '@/components/BadgeRow';
import { ProfileStatsRow } from '@/components/ProfileStatsRow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAccountSwitcher } from '@/hooks/useAccountSwitcher';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { TopNavBar } from '@/components/TopNavBar';
import { RootStackParamList } from '@/navigation/types';
import { MemberRole } from '@/types';
import { spacing } from '@/config/theme';
import { computeCampusProgress, CampusBadge } from '@/utils/campusPoints';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

type SocialLink = {
  icon: keyof typeof FontAwesome.glyphMap;
  url: string;
};

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

  // IG-style @handle derived from the name — a display convenience, no stored value.
  const handle = profile.fullName
    ? `@${profile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`
    : '@you';

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

  const hasSocieties = joinedSocieties.length > 0 || pendingSocieties.length > 0;

  const socialLinkEntries: (SocialLink | null)[] = [
    profile.linkedinLink ? { icon: 'linkedin', url: profile.linkedinLink } : null,
    profile.instagramLink ? { icon: 'instagram', url: profile.instagramLink } : null,
    profile.githubLink ? { icon: 'github', url: profile.githubLink } : null,
    profile.twitterLink ? { icon: 'twitter', url: profile.twitterLink } : null,
    profile.websiteLink ? { icon: 'globe', url: profile.websiteLink } : null
  ];
  const socialLinks = socialLinkEntries.filter((link): link is SocialLink => link !== null);

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
      <TopNavBar
        title="Profile"
        actionLabel="Settings"
        onPressAction={() => { navigation.navigate('Settings'); }}
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

        {/* Identity — IG layout: avatar left, stats right */}
        <View style={styles.identityRow}>
          <Avatar name={profile.fullName} size={84} url={profile.avatarUrl} />
          <View style={styles.identityStats}>
            <ProfileStatsRow
              stats={[
                { label: 'Societies', value: mySocietyIds.length },
                { label: 'Events', value: eventsAttended },
                { label: 'Points', value: campusProgress.points }
              ]}
            />
          </View>
        </View>

        {/* Name + bio block, left-aligned IG-style */}
        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
              {profile.fullName || 'Your name'}
            </Text>
            {profile.isVerifiedStudent ? (
              <MaterialIcons name="verified" size={18} color={theme.colors.primary} />
            ) : null}
          </View>
          {identityCaption ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{identityCaption}</Text>
          ) : null}
          {profile.isVerifiedStudent ? (
            <View style={styles.chipRow}>
              <BadgeChip label="Verified Student" variant="success" />
            </View>
          ) : null}
          {profile.bio ? (
            <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginTop: 2 }]}>
              {profile.bio}
            </Text>
          ) : null}
          {socialLinks.length > 0 ? (
            <View style={styles.socialRow}>
              {socialLinks.map((link) => (
                <Pressable
                  key={link.icon}
                  onPress={() => Linking.openURL(link.url)}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.socialChip,
                    { backgroundColor: theme.colors.surfaceSunken, opacity: pressed ? 0.6 : 1 }
                  ]}
                >
                  <FontAwesome name={link.icon} size={16} color={theme.colors.textPrimary} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

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

        {/* Your societies */}
        <View style={styles.section}>
          <SectionHeader title="Your societies" />
          {hasSocieties ? (
            <Card padding={0}>
              {joinedSocieties.map((society, index) => {
                const role = roleForSociety(society.id);
                return (
                  <React.Fragment key={society.id}>
                    {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} /> : null}
                    <ListRow
                      title={society.name}
                      subtitle={society.shortName || society.university || undefined}
                      leading={<Avatar name={society.name} size={40} url={society.logoUrl ?? undefined} />}
                      trailing={role && role !== 'Member' ? <BadgeChip label={role} variant="primary" /> : undefined}
                      chevron
                      onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}
                    />
                  </React.Fragment>
                );
              })}
              {pendingSocieties.map((society, index) => (
                <React.Fragment key={society.id}>
                  {joinedSocieties.length > 0 || index > 0 ? (
                    <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
                  ) : null}
                  <ListRow
                    title={society.name}
                    subtitle={society.shortName || society.university || undefined}
                    leading={<Avatar name={society.name} size={40} url={society.logoUrl ?? undefined} />}
                    trailing={<BadgeChip label="Pending" variant="warning" />}
                    chevron
                    onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}
                  />
                </React.Fragment>
              ))}
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="groups"
                title="No societies yet"
                subtitle="Discover and join societies at your university to see them here."
                actionLabel="Explore societies"
                onAction={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
              />
            </Card>
          )}
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
  accountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 32
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg
  },
  identityStats: {
    flex: 1
  },
  nameBlock: {
    gap: 4,
    marginTop: -6
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
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
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap'
  },
  socialChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
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
