import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useAuth } from '@/hooks/useAuth';
import { deleteMyAccount } from '@/services/api/me';
import { ApiError } from '@/services/api/client';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { BadgeChip } from '@/components/BadgeChip';
import { TopNavBar } from '@/components/TopNavBar';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const SettingsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    activeSocietyId,
    setActiveSocietyId,
    leaveSociety,
    allSocieties,
    mySocietyIds,
    pushEnabled,
    announcementsEnabled,
    pollUpdatesEnabled,
    remindersEnabled,
    setPushEnabled,
    setAnnouncementsEnabled,
    setPollUpdatesEnabled,
    setRemindersEnabled,
    themePreference,
    setThemePreference,
    textSizePreference,
    setTextSizePreference,
    profile
  } = useLocalAppState();

  const { signOut } = useAuth();

  const [showSecurity, setShowSecurity] = useState(false);

  const cycleThemePreference = () => {
    if (themePreference === 'Auto') setThemePreference('Light');
    else if (themePreference === 'Light') setThemePreference('Dark');
    else setThemePreference('Auto');
  };

  const cycleTextSize = () => {
    if (textSizePreference === 'Small') setTextSizePreference('Medium');
    else if (textSizePreference === 'Medium') setTextSizePreference('Large');
    else setTextSizePreference('Small');
  };

  const leaveActiveSociety = async (societyId: string) => {
    if (mySocietyIds.length <= 1) {
      Alert.alert('Cannot Leave', 'You need at least one society to continue using the app.');
      return;
    }
    const currentSociety = allSocieties.find((society) => society.id === societyId);
    Alert.alert(
      'Leave Society?',
      `Are you sure you want to leave ${currentSociety?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveSociety(societyId);
            } catch {
              Alert.alert('Error', 'Unable to leave right now.');
            }
          }
        }
      ]
    );
  };

  const logOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account, your posts and comments, and removes you from all societies. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Actually delete server-side before signing out — this used to
              // only sign the user out while promising permanent deletion.
              await deleteMyAccount();
            } catch (error) {
              Alert.alert(
                'Account not deleted',
                error instanceof ApiError && error.code === 'PRESIDENT_MUST_HAND_OVER'
                  ? error.message
                  : 'We could not delete your account right now. Please try again.',
              );
              return;
            }
            setPushEnabled(false);
            await signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  const switchTrackColor = { false: theme.colors.borderStrong, true: theme.colors.primary };

  const sectionCaption = (title: string) => (
    <Text style={[theme.typography.micro, styles.sectionCaption, { color: theme.colors.textTertiary }]}>{title}</Text>
  );

  const rowDivider = <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />;

  const destructiveRow = (
    label: string,
    icon: keyof typeof MaterialIcons.glyphMap,
    onPress: () => void
  ) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
      style={({ pressed }) => [
        styles.destructiveRow,
        { backgroundColor: pressed ? theme.colors.dangerSoft : 'transparent' }
      ]}
    >
      <MaterialIcons name={icon} size={22} color={theme.colors.danger} />
      <Text style={[theme.typography.bodyMedium, { color: theme.colors.danger }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title="Settings" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Account Section */}
        {sectionCaption('Your account')}
        <Card padding={0}>
          <ListRow
            title="Edit profile"
            subtitle="Name, bio, academics, and links"
            leading={<Ionicons name="person-circle-outline" size={24} color={theme.colors.primary} />}
            chevron
            onPress={() => navigation.navigate('EditProfile')}
          />
          {rowDivider}
          <ListRow
            title="Password & security"
            subtitle={showSecurity ? undefined : 'Manage your sign-in details'}
            leading={<MaterialIcons name="security" size={22} color={theme.colors.primary} />}
            trailing={
              <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>
                {showSecurity ? 'Hide' : 'Manage'}
              </Text>
            }
            onPress={() => setShowSecurity((prev) => !prev)}
          />
          {showSecurity ? (
            <View style={[styles.securityDetails, { backgroundColor: theme.colors.surfaceSunken }]}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Email</Text>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {profile.email || '—'}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>Password</Text>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>••••••••••</Text>
            </View>
          ) : null}
        </Card>

        {/* My Societies */}
        {sectionCaption('My societies')}
        <Card padding={0}>
          {mySocietyIds.map((id, index) => {
            const society = allSocieties.find((s) => s.id === id);
            if (!society) return null;
            const isActive = society.id === activeSocietyId;
            return (
              <View key={society.id}>
                {index > 0 ? rowDivider : null}
                <ListRow
                  title={society.name}
                  subtitle={isActive ? 'Active society' : 'Tap to make active'}
                  leading={
                    <MaterialIcons
                      name="groups"
                      size={22}
                      color={isActive ? theme.colors.primary : theme.colors.textTertiary}
                    />
                  }
                  trailing={
                    <View style={styles.societyTrailing}>
                      {isActive ? <BadgeChip label="Active" variant="primary" /> : null}
                      <Pressable onPress={() => leaveActiveSociety(society.id)} hitSlop={8}>
                        {({ pressed }) => (
                          <Ionicons
                            name="log-out-outline"
                            size={20}
                            color={theme.colors.danger}
                            style={{ opacity: pressed ? 0.5 : 1 }}
                          />
                        )}
                      </Pressable>
                    </View>
                  }
                  onPress={() => setActiveSocietyId(society.id)}
                />
              </View>
            );
          })}
        </Card>

        {/* Notifications */}
        {sectionCaption('Notifications')}
        <Card padding={0}>
          <ListRow
            title="Push notifications"
            leading={<Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />}
            trailing={<Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={switchTrackColor} />}
          />
          {rowDivider}
          <ListRow
            title="Event reminders"
            leading={<MaterialIcons name="event-available" size={22} color={theme.colors.primary} />}
            trailing={<Switch value={remindersEnabled} onValueChange={setRemindersEnabled} trackColor={switchTrackColor} />}
          />
          {rowDivider}
          <ListRow
            title="Announcements"
            leading={<Ionicons name="megaphone-outline" size={22} color={theme.colors.primary} />}
            trailing={<Switch value={announcementsEnabled} onValueChange={setAnnouncementsEnabled} trackColor={switchTrackColor} />}
          />
          {rowDivider}
          <ListRow
            title="Poll updates"
            leading={<Ionicons name="stats-chart-outline" size={22} color={theme.colors.primary} />}
            trailing={<Switch value={pollUpdatesEnabled} onValueChange={setPollUpdatesEnabled} trackColor={switchTrackColor} />}
          />
        </Card>

        {/* Appearance */}
        {sectionCaption('Appearance')}
        <Card padding={0}>
          <ListRow
            title="App theme"
            subtitle="Tap to cycle"
            leading={<Ionicons name="color-palette-outline" size={22} color={theme.colors.primary} />}
            trailing={<BadgeChip label={themePreference} variant="neutral" />}
            onPress={cycleThemePreference}
          />
          {rowDivider}
          <ListRow
            title="Text size"
            subtitle="Tap to cycle"
            leading={<Ionicons name="text-outline" size={22} color={theme.colors.primary} />}
            trailing={<BadgeChip label={textSizePreference} variant="neutral" />}
            onPress={cycleTextSize}
          />
        </Card>

        {/* More Info & Support */}
        {sectionCaption('More info and support')}
        <Card padding={0}>
          <ListRow
            title="Help & FAQs"
            leading={<Ionicons name="help-circle-outline" size={22} color={theme.colors.primary} />}
            chevron
          />
          {rowDivider}
          <ListRow
            title="Contact us"
            leading={<Ionicons name="mail-outline" size={22} color={theme.colors.primary} />}
            chevron
          />
          {rowDivider}
          <ListRow
            title="Privacy policy"
            leading={<Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} />}
            chevron
          />
          {rowDivider}
          <ListRow
            title="Terms of service"
            leading={<Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />}
            chevron
          />
        </Card>

        {/* Account actions */}
        {sectionCaption('Account')}
        <Card padding={0}>
          {destructiveRow('Log out', 'logout', logOut)}
          {rowDivider}
          {destructiveRow('Delete account', 'delete-outline', deleteAccount)}
        </Card>

        <Text style={[theme.typography.caption, styles.versionText, { color: theme.colors.textTertiary }]}>
          SocietyHub v1.0.4 • from Manchester with love
        </Text>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96
  },
  sectionCaption: {
    marginBottom: 8,
    marginTop: 24,
    paddingLeft: 8
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50
  },
  securityDetails: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    gap: 2
  },
  societyTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  destructiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16
  },
  versionText: {
    textAlign: 'center',
    marginVertical: 32
  }
});
