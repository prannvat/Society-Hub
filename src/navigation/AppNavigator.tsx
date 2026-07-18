import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { navigationRef } from './navigationRef';
import { RootStackParamList } from './types';
import { ConsumerNavigator } from './ConsumerNavigator';
// Lazy load admin components for better performance
const AdminNavigator = React.lazy(() => import('./AdminNavigator').then(module => ({ default: module.AdminNavigator })));
const UnionAdminNavigator = React.lazy(() => import('./UnionAdminNavigator').then(module => ({ default: module.UnionAdminNavigator })));
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { ProfileSetupScreen } from '@/screens/ProfileSetupScreen';
import { InterestSelectionScreen } from '@/screens/InterestSelectionScreen';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { AnnouncementsFeedScreen } from '@/screens/AnnouncementsFeedScreen';
import { AnnouncementDetailScreen } from '@/screens/AnnouncementDetailScreen';
import { AdminDashboardScreen } from '@/screens/AdminDashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { CreateEventScreen } from '@/screens/CreateEventScreen';
import { MemberProfileScreen } from '@/screens/MemberProfileScreen';
import { SocietyProfileScreen } from '@/screens/SocietyProfileScreen';
import { CreateSocietyScreen } from '@/screens/CreateSocietyScreen';
import { EditSocietyProfileScreen } from '@/screens/EditSocietyProfileScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { ExploreSocietiesScreen } from '@/screens/ExploreSocietiesScreen';
import { CommitteeRequestScreen } from '@/screens/CommitteeRequestScreen';
import { SocietyManageScreen } from '@/screens/SocietyManageScreen';
import { CreateHubScreen } from '@/screens/CreateHubScreen';
import { CreatePostScreen } from '@/screens/CreatePostScreen';
import { CreatePollScreen } from '@/screens/CreatePollScreen';
import { MembersDirectoryScreen } from '@/screens/MembersDirectoryScreen';
import { SocietyPollsScreen } from '@/screens/SocietyPollsScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

const NavigatorFallback = ({ icon }: { icon: keyof typeof MaterialIcons.glyphMap }) => {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: theme.colors.background }}>
      <MaterialIcons name={icon} size={44} color={theme.colors.textTertiary} />
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  );
};

const MainTabs = () => {
  const { currentMode } = useUserRoles();

  // Render different navigators based on current mode
  if (currentMode === 'Admin') {
    return (
      <React.Suspense fallback={<NavigatorFallback icon="admin-panel-settings" />}>
        <AdminNavigator />
      </React.Suspense>
    );
  }

  if (currentMode === 'UnionAdmin') {
    return (
      <React.Suspense fallback={<NavigatorFallback icon="account-balance" />}>
        <UnionAdminNavigator />
      </React.Suspense>
    );
  }

  return <ConsumerNavigator />;
};

export const AppNavigator = () => {
  const theme = useAppTheme();

  const navTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      primary: theme.colors.primary
    }
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          // Match the app background so screen transitions never flash white in dark mode.
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="InterestSelection" component={InterestSelectionScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AnnouncementsFeed" component={AnnouncementsFeedScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
        <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
        <Stack.Screen name="SocietyProfile" component={SocietyProfileScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />
        <Stack.Screen name="EditSocietyProfile" component={EditSocietyProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ExploreSocieties" component={ExploreSocietiesScreen} />
        <Stack.Screen name="CommitteeRequest" component={CommitteeRequestScreen} />
        <Stack.Screen name="SocietyManage" component={SocietyManageScreen} />
        <Stack.Screen name="CreateHub" component={CreateHubScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="CreatePoll" component={CreatePollScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="MembersDirectory" component={MembersDirectoryScreen} />
        <Stack.Screen name="SocietyPolls" component={SocietyPollsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
