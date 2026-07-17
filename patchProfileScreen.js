const fs = require('fs');
const content = `import React from 'react';
import { Alert, Pressable, Text, View, Linking, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { TopNavBar } from '@/components/TopNavBar';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSocietyId, allSocieties, mySocietyIds, profile, selectedInterests, activeSocietyRole, isAdminMode, setIsAdminMode } = useLocalAppState();
  const [activeTab, setActiveTab] = React.useState<'About' | 'Activity' | 'Badges'>('About');

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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 96, gap: 18 }}>
        <TopNavBar
          title="Profile"
          actionLabel="Menu"
          onPressAction={() => { navigation.navigate('Settings'); }}
        />

        <View style={{ alignItems: 'center', gap: 10, marginTop: 12 }}>
          <Avatar name={profile.fullName} size={90} url={profile.avatarUrl} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{profile.fullName}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>{profile.university} • {profile.course} • {profile.year}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <BadgeChip label={activeSocietyRole} variant="filled" />
            {profile.linkedinLink ? (
              <Pressable onPress={() => Linking.openURL(profile.linkedinLink!)} style={{ padding: 6, backgroundColor: '#0077b5', borderRadius: 14 }}>
                <FontAwesome name="linkedin" size={14} color="#FFF" />
              </Pressable>
            ) : null}
            {profile.instagramLink ? (
              <Pressable onPress={() => Linking.openURL(profile.instagramLink!)} style={{ padding: 6, backgroundColor: '#E1306C', borderRadius: 14 }}>
                <FontAwesome name="instagram" size={14} color="#FFF" />
              </Pressable>
            ) : null}
            {profile.githubLink ? (
              <Pressable onPress={() => Linking.openURL(profile.githubLink!)} style={{ padding: 6, backgroundColor: '#333', borderRadius: 14 }}>
                <FontAwesome name="github" size={14} color="#FFF" />
              </Pressable>
            ) : null}
            {profile.twitterLink ? (
              <Pressable onPress={() => Linking.openURL(profile.twitterLink!)} style={{ padding: 6, backgroundColor: '#1DA1F2', borderRadius: 14 }}>
                <FontAwesome name="twitter" size={14} color="#FFF" />
              </Pressable>
            ) : null}
            {profile.websiteLink ? (
              <Pressable onPress={() => Linking.openURL(profile.websiteLink!)} style={{ padding: 6, backgroundColor: theme.colors.textSecondary, borderRadius: 14 }}>
                <FontAwesome name="globe" size={14} color="#FFF" />
              </Pressable>
            ) : null}
          </View>
          
          {profile.bio ? <Text style={{ color: theme.colors.textPrimary, textAlign: 'center', marginHorizontal: 20, marginTop: 8, lineHeight: 20 }}>{profile.bio}</Text> : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          </View>
          <View style={{ flex: 1 }}>
            <OutlineButton label="Share Profile" onPress={() => Alert.alert('Share', 'Share action hit!')} />
          </View>
        </View>

        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: theme.colors.border, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <View style={{ alignItems: 'center' }}>
             <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 18 }}>17</Text>
             <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Events</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
             <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 18 }}>2023</Text>
             <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Since</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
             <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 18 }}>{mySocietyIds.length}</Text>
             <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Societies</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
          {(['About', 'Activity', 'Badges'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <BadgeChip label={tab} variant={activeTab === tab ? 'filled' : 'outlined'} />
            </Pressable>
          ))}
        </View>

        {activeSocietyRole !== 'Member' && (
          <View style={{ padding: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>Committee Mode</Text>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 }}>Role: {activeSocietyRole}</Text>
            </View>
            <Pressable onPress={handleToggleAdmin} style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: isAdminMode ? theme.colors.primary : theme.colors.border, justifyContent: 'center', paddingHorizontal: 2 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.background, alignSelf: isAdminMode ? 'flex-end' : 'flex-start' }} />
            </Pressable>
          </View>
        )}

        <View style={{ gap: 12, marginBottom: 16, paddingTop: 10 }}>
          {isAdminMode && (
            <OutlineButton label="Open Admin Dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};
`;
fs.writeFileSync('src/screens/ProfileScreen.tsx', content);
