import React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { ListItem } from '@/components/ListItem';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { societies } from '@/data/societies';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { TopNavBar } from '@/components/TopNavBar';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSocietyId, profile, updateProfile, selectedInterests, activeSocietyRole, isAdminMode, setIsAdminMode } = useLocalAppState();
  const [activeTab, setActiveTab] = React.useState<'About' | 'Activity' | 'Badges'>('About');
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileName, setProfileName] = React.useState(profile.fullName);
  const [email, setEmail] = React.useState(profile.email);
  const [university, setUniversity] = React.useState(profile.university);
  const [course, setCourse] = React.useState(profile.course);
  const [year, setYear] = React.useState(profile.year);

  const resetProfileDraft = () => {
    setProfileName(profile.fullName);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setYear(profile.year);
    setIsEditing(false);
  };

  React.useEffect(() => {
    setProfileName(profile.fullName);
    setEmail(profile.email);
    setUniversity(profile.university);
    setCourse(profile.course);
    setYear(profile.year);
  }, [profile]);

  React.useEffect(() => {
    if (activeSocietyRole === 'Member' && isAdminMode) {
      setIsAdminMode(false);
    }
  }, [activeSocietyRole, isAdminMode, setIsAdminMode]);

  const handleToggleAdmin = () => {
    if (activeSocietyRole === 'Member') {
      Alert.alert('Access Required', 'Only Committee and Presidents can enable committee mode for this society.');
      return;
    }

    setIsAdminMode(!isAdminMode);
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 96, gap: 18 }}>
        <TopNavBar
          title="Profile"
          actionLabel={isEditing ? 'Cancel' : 'Edit'}
          onPressAction={() => {
            if (isEditing) {
              resetProfileDraft();
              return;
            }

            setIsEditing(true);
          }}
        />

        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 24,
            padding: 20,
            marginTop: 8,
            marginBottom: 16,
            shadowColor: theme.shadow.shadowColor,
            shadowOffset: theme.shadow.shadowOffset,
            shadowOpacity: theme.shadow.shadowOpacity,
            shadowRadius: theme.shadow.shadowRadius,
            elevation: theme.shadow.elevation,
            gap: 14
          }}
        >
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Avatar name={profileName} size={76} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800' }}>{profileName}</Text>
            <BadgeChip label={activeSocietyRole} variant="filled" />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{university} • {year}</Text>
          </View>

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 100 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Events</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 4 }}>17</Text>
            </View>
            <View style={{ flex: 1, minWidth: 100 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Since</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 4 }}>2023</Text>
            </View>
            <View style={{ flex: 1, minWidth: 100 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Societies</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 4 }}>3</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {(['About', 'Activity', 'Badges'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <BadgeChip label={tab} variant={activeTab === tab ? 'filled' : 'outlined'} />
            </Pressable>
          ))}
        </View>

        <View
          style={{
            padding: 18,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: theme.shadow.shadowColor,
            shadowOffset: theme.shadow.shadowOffset,
            shadowOpacity: theme.shadow.shadowOpacity,
            shadowRadius: theme.shadow.shadowRadius,
            elevation: theme.shadow.elevation
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>Committee Mode</Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 }}>Role: {activeSocietyRole}</Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 3 }}>Only Committee and Presidents can toggle this mode.</Text>
          </View>
          <Pressable
            onPress={handleToggleAdmin}
            style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: isAdminMode ? theme.colors.primary : theme.colors.border, justifyContent: 'center', paddingHorizontal: 2 }}
          >
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.background, alignSelf: isAdminMode ? 'flex-end' : 'flex-start' }} />
          </Pressable>
        </View>

        <View style={{ gap: 12, marginBottom: 16 }}>
          <OutlineButton label="Open Settings" onPress={() => navigation.navigate('Settings')} />
          {isAdminMode && (
            <OutlineButton label="Open Admin Dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
          )}
        </View>

        {isEditing ? (
          <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, padding: 18, gap: 14, marginBottom: 16, backgroundColor: theme.colors.surface }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Edit Profile</Text>

            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />
            <TextInput
              value={university}
              onChangeText={setUniversity}
              placeholder="University"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />
            <TextInput
              value={course}
              onChangeText={setCourse}
              placeholder="Course"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="Year"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />

            <PrimaryButton
              label="Save Changes"
              onPress={() => {
                updateProfile({
                  ...profile,
                  fullName: profileName,
                  email,
                  university,
                  course,
                  year
                });
                setIsEditing(false);
              }}
            />
            <OutlineButton label="Discard Changes" onPress={resetProfileDraft} />
          </View>
        ) : null}

        {activeTab === 'About' ? (
          <View style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, padding: 18, gap: 16, marginBottom: 16, shadowColor: theme.shadow.shadowColor, shadowOffset: theme.shadow.shadowOffset, shadowOpacity: theme.shadow.shadowOpacity, shadowRadius: theme.shadow.shadowRadius, elevation: theme.shadow.elevation }}>
            <View>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 10 }}>My Societies</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {societies.map((society) => (
                  <View key={society.id} style={{ minWidth: 90 }}>
                    <BadgeChip label={society.shortName} variant={society.id === activeSocietyId ? 'filled' : 'outlined'} />
                    <Text
                      style={{ color: theme.colors.primary, marginTop: 6, fontSize: 12 }}
                      onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}
                    >
                      View
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <ListItem label="Email" right={<Text style={{ color: theme.colors.textSecondary }}>{email}</Text>} />
            <ListItem label="University" right={<Text style={{ color: theme.colors.textSecondary }}>{university}</Text>} />
            <ListItem label="Course" right={<Text style={{ color: theme.colors.textSecondary }}>{course}</Text>} />
            <ListItem label="Year" right={<Text style={{ color: theme.colors.textSecondary }}>{year}</Text>} />
            <ListItem
              label="Interests"
              right={<Text style={{ color: theme.colors.textSecondary }}>{selectedInterests.slice(0, 2).join(', ') || 'None'}</Text>}
            />
          </View>
        ) : null}

        {activeTab === 'Activity' ? (
          <View style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, padding: 18, gap: 10, marginBottom: 16, shadowColor: theme.shadow.shadowColor, shadowOffset: theme.shadow.shadowOffset, shadowOpacity: theme.shadow.shadowOpacity, shadowRadius: theme.shadow.shadowRadius, elevation: theme.shadow.elevation }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Recent Activity</Text>
            <ListItem label="Attended Langar Night" right={<Text style={{ color: theme.colors.textSecondary }}>2d ago</Text>} />
            <ListItem label="Posted committee update" right={<Text style={{ color: theme.colors.textSecondary }}>5d ago</Text>} />
            <ListItem label="Joined Manchester Tech Society" right={<Text style={{ color: theme.colors.textSecondary }}>2w ago</Text>} />
          </View>
        ) : null}

        {activeTab === 'Badges' ? (
          <View style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, padding: 18, gap: 12, marginBottom: 16, shadowColor: theme.shadow.shadowColor, shadowOffset: theme.shadow.shadowOffset, shadowOpacity: theme.shadow.shadowOpacity, shadowRadius: theme.shadow.shadowRadius, elevation: theme.shadow.elevation }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Badge Cabinet</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {['First Event', '1 Year Member', 'Volunteer', 'Committee', 'Mentor', 'Top RSVP'].map((badge) => (
                <View key={badge} style={{ flexGrow: 1, flexBasis: 150, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 14 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{badge}</Text>
                  <Text style={{ color: theme.colors.textSecondary, marginTop: 6, fontSize: 12 }}>Achievement unlocked</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

      </View>
    </ScreenLayout>
  );
};
