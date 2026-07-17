import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getTabNavigatorOptions } from './tabOptions';
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
        ...getTabNavigatorOptions(theme),
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
