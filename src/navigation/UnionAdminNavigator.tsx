import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { NotificationBell } from '@/components/NotificationBell';
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

/**
 * Identity bar: names the console so it's unmistakable this is the students' union's
 * university-wide oversight tool — not a personal or single-society surface. The warning
 * tint mirrors the mode banner and distinguishes it from student/society brand colours.
 */
const UnionIdentityBar = () => {
  const theme = useAppTheme();
  const { unionAdminRelationships, selectedUniversityId } = useUserRoles();
  const university = unionAdminRelationships.find((entry) => entry.universityId === selectedUniversityId);

  return (
    <View style={[styles.identityBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={[styles.identityIcon, { backgroundColor: theme.colors.warningSoft }]}>
        <MaterialIcons name="account-balance" size={22} color={theme.colors.warning} />
      </View>
      <View style={styles.identityText}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {`${university?.universityName ?? 'University'} · Students’ Union`}
        </Text>
        <Text style={[theme.typography.micro, { color: theme.colors.warning }]} numberOfLines={1}>
          Union admin console
        </Text>
      </View>
      <NotificationBell />
    </View>
  );
};

export const UnionAdminNavigator = () => {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Persistent mode banner — the user should always know they are in union-admin mode. */}
      <RoleSwitcher variant="banner" />
      <UnionIdentityBar />
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

const styles = StyleSheet.create({
  identityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  identityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  identityText: {
    flex: 1,
    gap: 1
  }
});
