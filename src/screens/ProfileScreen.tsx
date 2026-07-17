import React from 'react';
import { Alert, Pressable, Share, Text, View, Linking, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { TopNavBar } from '@/components/TopNavBar';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

type SocialLink = {
  icon: keyof typeof FontAwesome.glyphMap;
  url: string;
};

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { mySocietyIds, profile, activeSocietyRole, rsvpedEventIds, exploreEvents } = useLocalAppState();
  const { canSwitchToAdmin } = useUserRoles();
  const { user, signOut } = useAuth();

  // Events the user has RSVPed across all loaded events (deduplicated by id).
  const eventsAttended = new Set([
    ...rsvpedEventIds,
    ...exploreEvents.filter((event) => event.isRsvpedByCurrentUser).map((event) => event.id),
  ]).size;

  const memberSinceYear = user?.createdAt ? String(new Date(user.createdAt).getFullYear()) : '—';

  const identityCaption = [profile.university, profile.course, profile.year].filter(Boolean).join(' • ');

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopNavBar
          title="Profile"
          actionLabel="Settings"
          onPressAction={() => { navigation.navigate('Settings'); }}
        />

        {/* Identity block */}
        <View style={styles.identity}>
          <Avatar name={profile.fullName} size={96} url={profile.avatarUrl} />
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
            {profile.fullName}
          </Text>
          {identityCaption ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
              {identityCaption}
            </Text>
          ) : null}
          <View style={styles.chipRow}>
            <BadgeChip label={activeSocietyRole} variant="primary" />
            {profile.isVerifiedStudent ? <BadgeChip label="Verified Student" variant="success" /> : null}
          </View>
          {profile.bio ? (
            <Text style={[theme.typography.body, styles.bio, { color: theme.colors.textPrimary }]}>
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

        {/* Stat row */}
        <Card padding={14}>
          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{eventsAttended}</Text>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Events</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statCell}>
              <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{memberSinceYear}</Text>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Since</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statCell}>
              <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{mySocietyIds.length}</Text>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Societies</Text>
            </View>
          </View>
        </Card>

        {/* Grouped actions */}
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
            title="Share profile"
            subtitle="Invite friends to SocietyHub"
            leading={<MaterialIcons name="ios-share" size={22} color={theme.colors.primary} />}
            chevron
            onPress={handleShareProfile}
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

        {/* App mode switcher */}
        {canSwitchToAdmin && (
          <Card>
            <View style={styles.roleSwitcherWrap}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>App Mode</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Switch between student and admin views
                </Text>
              </View>
              <RoleSwitcher showModeText={true} />
            </View>
          </Card>
        )}

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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 96,
    gap: 18
  },
  identity: {
    alignItems: 'center',
    gap: 8,
    marginTop: 12
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  bio: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 4
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  socialChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch'
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50
  },
  roleSwitcherWrap: {
    alignItems: 'center',
    gap: 12
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
