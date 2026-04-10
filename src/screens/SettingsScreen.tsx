import React from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { ListItem } from '@/components/ListItem';
import { TopNavBar } from '@/components/TopNavBar';
import { GlassCard } from '@/components/GlassCard';
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
    setTextSizePreference
  } = useLocalAppState();
  const [showSecurity, setShowSecurity] = React.useState(false);
  const [showFaqs, setShowFaqs] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);

  const cycleThemePreference = () => {
    if (themePreference === 'Auto') {
      setThemePreference('Light');
      return;
    }

    if (themePreference === 'Light') {
      setThemePreference('Dark');
      return;
    }

    setThemePreference('Auto');
  };

  const cycleTextSize = () => {
    if (textSizePreference === 'Small') {
      setTextSizePreference('Medium');
      return;
    }

    if (textSizePreference === 'Medium') {
      setTextSizePreference('Large');
      return;
    }

    setTextSizePreference('Small');
  };

  const leaveActiveSociety = () => {
    if (mySocietyIds.length <= 1) {
      Alert.alert('Cannot Leave', 'You need at least one society to continue using the app. Join another society first.');
      return;
    }

    const currentSociety = allSocieties.find((society) => society.id === activeSocietyId);
    leaveSociety(activeSocietyId);
    Alert.alert('Left Society', `You have left ${currentSociety?.name ?? 'the active society'}.`);
  };

  const deleteLocalAccount = () => {
    setPushEnabled(false);
    setAnnouncementsEnabled(false);
    setPollUpdatesEnabled(false);
    setRemindersEnabled(false);
    setThemePreference('Auto');
    setTextSizePreference('Medium');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }]
    });
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 96, gap: 18 }}>
        <TopNavBar title="Settings" actionLabel="Help" onPressAction={() => setShowFaqs((prev) => !prev)} />

        <GlassCard
          style={{
            shadowColor: theme.shadow.shadowColor,
            shadowOffset: theme.shadow.shadowOffset,
            shadowOpacity: theme.shadow.shadowOpacity,
            shadowRadius: theme.shadow.shadowRadius,
            elevation: theme.shadow.elevation
          }}
        >
          <View style={{ gap: 10 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 20, fontWeight: '800' }}>Settings</Text>
            <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>Refine your SocietyHub experience with crisp controls for notifications, appearance, and membership settings.</Text>
          </View>
        </GlassCard>

        <View style={{ gap: 16 }}>
          <GlassCard
            style={{
              shadowColor: theme.shadow.shadowColor,
              shadowOffset: theme.shadow.shadowOffset,
              shadowOpacity: theme.shadow.shadowOpacity,
              shadowRadius: theme.shadow.shadowRadius,
              elevation: theme.shadow.elevation
            }}
          >
            <View style={{ overflow: 'hidden' }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', paddingBottom: 14 }}>Account</Text>
              <ListItem label="Profile" right={<Text style={{ color: theme.colors.textSecondary }}>{'>'}</Text>} onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })} />
              <ListItem label="Email & Password" right={<Text style={{ color: theme.colors.textSecondary }}>{showSecurity ? 'Hide' : 'Manage'}</Text>} onPress={() => setShowSecurity((prev) => !prev)} />

              {showSecurity ? (
                <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14, marginTop: 14, gap: 8 }}>
                  <Text style={{ color: theme.colors.textPrimary }}>Email: harleen@manchester.ac.uk</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>Password: ••••••••••</Text>
                  <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => setShowSecurity(false)}>
                    Save Local Security Preferences
                  </Text>
                </View>
              ) : null}
            </View>
          </GlassCard>

          <GlassCard
            style={{
              shadowColor: theme.shadow.shadowColor,
              shadowOffset: theme.shadow.shadowOffset,
              shadowOpacity: theme.shadow.shadowOpacity,
              shadowRadius: theme.shadow.shadowRadius,
              elevation: theme.shadow.elevation
            }}
          >
            <View style={{ overflow: 'hidden' }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', paddingBottom: 14 }}>My Societies</Text>
              {mySocietyIds.map((id) => {
                const society = allSocieties.find((s) => s.id === id);
                if (!society) return null;
                return (
                  <ListItem
                    key={society.id}
                    label={society.name}
                    right={<Text style={{ color: society.id === activeSocietyId ? theme.colors.primary : theme.colors.textSecondary }}>{society.id === activeSocietyId ? 'Active' : 'Switch'}</Text>}
                    onPress={() => setActiveSocietyId(society.id)}
                  />
                );
              })}
            </View>
          </GlassCard>

          <GlassCard
            style={{
              shadowColor: theme.shadow.shadowColor,
              shadowOffset: theme.shadow.shadowOffset,
              shadowOpacity: theme.shadow.shadowOpacity,
              shadowRadius: theme.shadow.shadowRadius,
              elevation: theme.shadow.elevation
            }}
          >
            <View style={{ overflow: 'hidden' }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', paddingBottom: 14 }}>Notifications</Text>
              <ListItem
                label="Push Notifications"
                right={<Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
                onPress={() => setPushEnabled(!pushEnabled)}
              />
              <ListItem
                label="Event Reminders"
                right={<Switch value={remindersEnabled} onValueChange={setRemindersEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
                onPress={() => setRemindersEnabled(!remindersEnabled)}
              />
              <ListItem
                label="Announcements"
                right={<Switch value={announcementsEnabled} onValueChange={setAnnouncementsEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
                onPress={() => setAnnouncementsEnabled(!announcementsEnabled)}
              />
              <ListItem
                label="Poll Updates"
                right={<Switch value={pollUpdatesEnabled} onValueChange={setPollUpdatesEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
                onPress={() => setPollUpdatesEnabled(!pollUpdatesEnabled)}
              />
            </View>
          </GlassCard>

          <GlassCard
            style={{
              shadowColor: theme.shadow.shadowColor,
              shadowOffset: theme.shadow.shadowOffset,
              shadowOpacity: theme.shadow.shadowOpacity,
              shadowRadius: theme.shadow.shadowRadius,
              elevation: theme.shadow.elevation
            }}
          >
            <View style={{ overflow: 'hidden' }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', paddingBottom: 14 }}>Appearance</Text>
              <ListItem label="Theme" right={<Text style={{ color: theme.colors.textSecondary }}>{themePreference}</Text>} onPress={cycleThemePreference} />
              <ListItem label="Text Size" right={<Text style={{ color: theme.colors.textSecondary }}>{textSizePreference}</Text>} onPress={cycleTextSize} />
            </View>
          </GlassCard>

          <GlassCard
            style={{
              shadowColor: theme.shadow.shadowColor,
              shadowOffset: theme.shadow.shadowOffset,
              shadowOpacity: theme.shadow.shadowOpacity,
              shadowRadius: theme.shadow.shadowRadius,
              elevation: theme.shadow.elevation
            }}
          >
            <View style={{ overflow: 'hidden' }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', paddingBottom: 14 }}>Support</Text>
              <ListItem label="FAQs" right={<Text style={{ color: theme.colors.textSecondary }}>{showFaqs ? 'Hide' : 'Open'}</Text>} onPress={() => setShowFaqs((prev) => !prev)} />
              {showFaqs ? (
                <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14, marginTop: 14, gap: 8 }}>
                  <Text style={{ color: theme.colors.textPrimary }}>How do I join events? Open an event and tap RSVP.</Text>
                  <Text style={{ color: theme.colors.textPrimary }}>How do I switch societies? Use the Society section above.</Text>
                  <Text style={{ color: theme.colors.textPrimary }}>Can I mute notifications? Yes, toggle Push Notifications.</Text>
                </View>
              ) : null}
              <ListItem label="Contact Us" right={<Text style={{ color: theme.colors.textSecondary }}>{showContact ? 'Hide' : 'Open'}</Text>} onPress={() => setShowContact((prev) => !prev)} />
              {showContact ? (
                <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14, marginTop: 14, gap: 4 }}>
                  <Text style={{ color: theme.colors.textPrimary }}>Email: support@societyhub.app</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>Response time: under 24 hours</Text>
                </View>
              ) : null}
            </View>
          </GlassCard>

          <GlassCard
            style={{
              borderColor: theme.colors.error,
              shadowColor: theme.shadow.shadowColor,
              shadowOffset: theme.shadow.shadowOffset,
              shadowOpacity: theme.shadow.shadowOpacity,
              shadowRadius: theme.shadow.shadowRadius,
              elevation: theme.shadow.elevation
            }}
          >
            <View style={{ overflow: 'hidden' }}>
              <Text style={{ color: theme.colors.error, fontWeight: '700', paddingBottom: 14 }}>Danger Zone</Text>
              <ListItem label="Leave Society" right={<Text style={{ color: theme.colors.error }}>Confirm</Text>} onPress={leaveActiveSociety} />
              <ListItem label="Delete Account" right={<Text style={{ color: theme.colors.error }}>Reset</Text>} onPress={deleteLocalAccount} />
            </View>
          </GlassCard>
        </View>
      </View>
    </ScreenLayout>
  );
};
