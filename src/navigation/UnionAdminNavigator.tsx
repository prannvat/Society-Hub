import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { getTabNavigatorOptions } from './tabOptions';
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Persistent mode banner — the user should always know they are in union-admin mode. */}
      <RoleSwitcher variant="banner" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...getTabNavigatorOptions(theme),
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
    </View>
  );
};
