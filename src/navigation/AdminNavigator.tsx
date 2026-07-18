import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getTabNavigatorOptions } from './tabOptions';
import { SocietyHomeScreen } from '@/screens/society/SocietyHomeScreen';
import { SocietyInsightsScreen } from '@/screens/society/SocietyInsightsScreen';
import { SocietyAccountProfileScreen } from '@/screens/society/SocietyAccountProfileScreen';
import { MembersDirectoryScreen } from '@/screens/MembersDirectoryScreen';

export type AdminTabParamList = {
  SocietyHome: undefined;
  Insights: undefined;
  Members: undefined;
  SocietyAccount: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

/** Identity bar: shows the society account you're acting as; tap to switch accounts. */
const AccountBar = () => {
  const theme = useAppTheme();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties } = useLocalAppState();
  const [open, setOpen] = useState(false);
  const society = allSocieties.find((s) => s.id === selectedAdminSocietyId);

  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <Pressable style={styles.barInner} onPress={() => setOpen(true)} hitSlop={8}>
        <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={28} />
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, maxWidth: 200 }]} numberOfLines={1}>
          {society?.name ?? 'Society'}
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm }]}>
          <Text style={[theme.typography.micro, { color: theme.colors.primary }]}>MANAGING</Text>
        </View>
        <MaterialIcons name="expand-more" size={22} color={theme.colors.textSecondary} />
      </Pressable>
      <AccountSwitcher visible={open} onClose={() => setOpen(false)} />
    </View>
  );
};

export const AdminNavigator = () => {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AccountBar />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...getTabNavigatorOptions(theme),
          tabBarIcon: ({ color, size }) => {
            const iconNameMap: Record<keyof AdminTabParamList, keyof typeof MaterialIcons.glyphMap> = {
              SocietyHome: 'home',
              Insights: 'insights',
              Members: 'groups',
              SocietyAccount: 'account-circle',
            };
            return <MaterialIcons name={iconNameMap[route.name]} size={size ?? 22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="SocietyHome" component={SocietyHomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Insights" component={SocietyInsightsScreen} options={{ tabBarLabel: 'Insights' }} />
        <Tab.Screen name="Members" component={MembersDirectoryScreen} options={{ tabBarLabel: 'Members' }} />
        <Tab.Screen name="SocietyAccount" component={SocietyAccountProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  barInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  badge: { paddingHorizontal: 6, paddingVertical: 2 },
});
