import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList, MainTabParamList } from './types';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { ProfileSetupScreen } from '@/screens/ProfileSetupScreen';
import { InterestSelectionScreen } from '@/screens/InterestSelectionScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { EventsListScreen } from '@/screens/EventsListScreen';
import { MembersDirectoryScreen } from '@/screens/MembersDirectoryScreen';
import { SocietyPollsScreen } from '@/screens/SocietyPollsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { AnnouncementsFeedScreen } from '@/screens/AnnouncementsFeedScreen';
import { AnnouncementDetailScreen } from '@/screens/AnnouncementDetailScreen';
import { AdminDashboardScreen } from '@/screens/AdminDashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { CreateEventScreen } from '@/screens/CreateEventScreen';
import { MemberProfileScreen } from '@/screens/MemberProfileScreen';
import { SocietyProfileScreen } from '@/screens/SocietyProfileScreen';
import { CreateSocietyScreen } from '@/screens/CreateSocietyScreen';
import { ExploreSocietiesScreen } from '../screens/ExploreSocietiesScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 82 : 68,
          paddingBottom: Platform.OS === 'ios' ? 18 : 10,
          paddingTop: Platform.OS === 'ios' ? 8 : 6,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          elevation: Platform.OS === 'android' ? 8 : 0,
          shadowColor: Platform.OS === 'ios' ? '#000000' : undefined,
          shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
          shadowOpacity: Platform.OS === 'ios' ? 0.08 : undefined,
          shadowRadius: Platform.OS === 'ios' ? 8 : undefined
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        },
        tabBarIcon: ({ color, size }) => {
          const iconNameMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            Home: 'home-filled',
            Events: 'event',
            Members: 'groups',
            Polls: 'poll',
            Profile: 'person'
          };

          return <MaterialIcons name={iconNameMap[route.name]} size={size ?? 22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsListScreen} />
      <Tab.Screen name="Members" component={MembersDirectoryScreen} />
      <Tab.Screen name="Polls" component={SocietyPollsScreen} options={{ tabBarLabel: 'Polls' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
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
        <Stack.Screen name="ExploreSocieties" component={ExploreSocietiesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
