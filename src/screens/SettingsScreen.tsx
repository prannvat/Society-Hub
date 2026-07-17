import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { ListItem } from '@/components/ListItem';
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
    setTextSizePreference
  } = useLocalAppState();

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
        onPress: () => {
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        }
      }
    ]);
  };

  const deleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account and remove you from all societies.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => {
          setPushEnabled(false);
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        }
      }
    ]);
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{title}</Text>
  );

  const Chevron = () => <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />;

  return (
    <ScreenLayout>
      <TopNavBar title="Settings and activity" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Account Section */}
        {renderSectionHeader('Your account')}
        <View style={styles.sectionWrap}>
          <ListItem 
            label="Edit Profile"
            left={<Ionicons name="person-circle-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Chevron />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <ListItem 
            label="Password & Security"
            left={<MaterialIcons name="security" size={24} color={theme.colors.textPrimary} />}
            right={<Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{showSecurity ? 'Hide' : 'Manage'}</Text>}
            onPress={() => setShowSecurity((prev) => !prev)}
          />
          {showSecurity ? (
            <View style={[styles.securityDetails, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 13, marginBottom: 4 }}>Email: harleen@manchester.ac.uk</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Password: ••••••••••</Text>
              <Text style={{ color: theme.colors.primary, fontWeight: '700', marginTop: 12, fontSize: 14 }} onPress={() => setShowSecurity(false)}>
                Secure Account
              </Text>
            </View>
          ) : null}
          <ListItem 
            label="Personal details"
            left={<Ionicons name="documents-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Chevron />}
          />
        </View>

        {/* My Societies */}
        {renderSectionHeader('My Societies')}
        <View style={styles.sectionWrap}>
          {mySocietyIds.map((id) => {
            const society = allSocieties.find((s) => s.id === id);
            if (!society) return null;
            const isActive = society.id === activeSocietyId;
            return (
              <ListItem
                key={society.id}
                label={society.name}
                left={<MaterialIcons name="groups" size={24} color={isActive ? theme.colors.primary : theme.colors.textPrimary} />}
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: isActive ? theme.colors.primary : theme.colors.textSecondary, fontWeight: isActive ? '700' : '400', fontSize: 13 }}>
                      {isActive ? 'Active' : 'Switch'}
                    </Text>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.error} onPress={() => leaveActiveSociety(society.id)} />
                  </View>
                }
                onPress={() => setActiveSocietyId(society.id)}
              />
            );
          })}
        </View>

        {/* How you use SocietyHub */}
        {renderSectionHeader('How you use SocietyHub')}
        <View style={styles.sectionWrap}>
          <ListItem
            label="Push Notifications"
            left={<Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
          />
          <ListItem
            label="Event Reminders"
            left={<MaterialIcons name="event-available" size={24} color={theme.colors.textPrimary} />}
            right={<Switch value={remindersEnabled} onValueChange={setRemindersEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
          />
          <ListItem
            label="Announcements"
            left={<Ionicons name="megaphone-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Switch value={announcementsEnabled} onValueChange={setAnnouncementsEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
          />
          <ListItem
            label="Poll Updates"
            left={<Ionicons name="stats-chart-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Switch value={pollUpdatesEnabled} onValueChange={setPollUpdatesEnabled} trackColor={{ false: '#9CA3AF', true: theme.colors.primary }} />}
          />
        </View>

        {/* App Settings */}
        {renderSectionHeader('App settings')}
        <View style={styles.sectionWrap}>
          <ListItem
            label="App Theme"
            left={<Ionicons name="color-palette-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{themePreference}</Text>}
            onPress={cycleThemePreference}
          />
          <ListItem
            label="Text Size"
            left={<Ionicons name="text-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{textSizePreference}</Text>}
            onPress={cycleTextSize}
          />
        </View>

        {/* More Info & Support */}
        {renderSectionHeader('More info and support')}
        <View style={styles.sectionWrap}>
          <ListItem 
            label="Help & FAQs"
            left={<Ionicons name="help-circle-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Chevron />}
          />
          <ListItem 
            label="Contact Us"
            left={<Ionicons name="mail-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Chevron />}
          />
          <ListItem 
            label="Privacy Policy"
            left={<Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Chevron />}
          />
          <ListItem 
            label="Terms of Service"
            left={<Ionicons name="document-text-outline" size={24} color={theme.colors.textPrimary} />}
            right={<Chevron />}
          />
        </View>

        {/* Logins */}
        {renderSectionHeader('Login & Account')}
        <View style={styles.sectionWrap}>
          <ListItem 
            label="Log out"
            left={<MaterialIcons name="logout" size={24} color={theme.colors.primary} />}
            onPress={logOut}
          />
          <ListItem 
            label="Delete account"
            left={<MaterialIcons name="delete-outline" size={24} color={theme.colors.error} />}
            onPress={deleteAccount}
          />
        </View>

        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>SocietyHub v1.0.4 • from Manchester with ❤️</Text>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 20,
    paddingLeft: 8,
    letterSpacing: 0.5
  },
  sectionWrap: {
    backgroundColor: 'transparent',
  },
  securityDetails: {
    padding: 16,
    borderBottomWidth: 1,
  },
  versionText: {
    textAlign: 'center',
    marginVertical: 40,
    fontSize: 12,
  }
});
