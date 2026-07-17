import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { CommitteeRequestsScreen } from '@/screens/union-admin/CommitteeRequestsScreen';
import { UnionDashboardScreen } from '@/screens/union-admin/UnionDashboardScreen';
import { UnionSocietiesScreen } from '@/screens/union-admin/UnionSocietiesScreen';
import { UnionSettingsScreen } from '@/screens/union-admin/UnionSettingsScreen';

export type UnionAdminTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Societies: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<UnionAdminTabParamList>();

export const UnionAdminNavigator = () => {
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
          const iconNameMap: Record<keyof UnionAdminTabParamList, keyof typeof MaterialIcons.glyphMap> = {
            Dashboard: 'dashboard',
            Requests: 'approval',
            Societies: 'groups',
            Settings: 'settings',
            Profile: 'person'
          };

          return <MaterialIcons name={iconNameMap[route.name]} size={size ?? 22} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={UnionDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Requests" 
        component={CommitteeRequestsScreen}
        options={{ tabBarLabel: 'Requests' }}
      />
      <Tab.Screen
        name="Societies"
        component={UnionSocietiesScreen}
        options={{ tabBarLabel: 'Societies' }}
      />
      <Tab.Screen
        name="Settings"
        component={UnionSettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};