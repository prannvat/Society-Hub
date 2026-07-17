import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { AdminDashboardScreen } from '@/screens/AdminDashboardScreen';
import { AnnouncementsFeedScreen } from '@/screens/AnnouncementsFeedScreen';
import { SocietyPollsScreen } from '@/screens/SocietyPollsScreen';
import { MembersDirectoryScreen } from '@/screens/MembersDirectoryScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

export type AdminTabParamList = {
  Dashboard: undefined;
  Content: undefined;
  Members: undefined;
  Polls: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminNavigator = () => {
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
          const iconNameMap: Record<keyof AdminTabParamList, keyof typeof MaterialIcons.glyphMap> = {
            Dashboard: 'dashboard',
            Content: 'article',
            Members: 'groups',
            Polls: 'poll',
            Profile: 'person'
          };

          return <MaterialIcons name={iconNameMap[route.name]} size={size ?? 22} color={color} />;
        }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Content" 
        component={AnnouncementsFeedScreen}
        options={{ tabBarLabel: 'Content' }}
      />
      <Tab.Screen 
        name="Members" 
        component={MembersDirectoryScreen}
        options={{ tabBarLabel: 'Members' }}
      />
      <Tab.Screen 
        name="Polls" 
        component={SocietyPollsScreen}
        options={{ tabBarLabel: 'Polls' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};