import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
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


const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs = () => {
  const { currentMode } = useUserRoles();

  // Render different navigators based on current mode
  if (currentMode === 'Admin') {
    return (
      <React.Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="admin-panel-settings" size={48} color="#666" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading Admin Dashboard...</Text>
        </View>
      }>
        <AdminNavigator />
      </React.Suspense>
    );
  }

  if (currentMode === 'UnionAdmin') {
    return (
      <React.Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="school" size={48} color="#666" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading Union Admin Dashboard...</Text>
        </View>
      }>
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
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
