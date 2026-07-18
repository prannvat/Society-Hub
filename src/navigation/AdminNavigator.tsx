import React, { useEffect, useState } from 'react';
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

/**
 * Identity bar: shows the society account you're acting as; tap to switch accounts.
 * The active society's brand colour tints the avatar ring and the "Managing" pill so
 * the whole surface reads as that society — exactly like an IG business account.
 */
const AccountBar = ({ brand }: { brand: string }) => {
  const theme = useAppTheme();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties } = useLocalAppState();
  const [open, setOpen] = useState(false);
  const society = allSocieties.find((s) => s.id === selectedAdminSocietyId);

  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <Pressable
        style={({ pressed }) => [styles.barInner, { opacity: pressed ? 0.6 : 1 }]}
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Managing ${society?.name ?? 'society'}. Tap to switch account`}
      >
        <View style={[styles.avatarRing, { borderColor: brand }]}>
          <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={26} />
        </View>
        <View style={styles.barText}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {society?.name ?? 'Society'}
          </Text>
          <View style={styles.managingRow}>
            <View style={[styles.dot, { backgroundColor: brand }]} />
            <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>MANAGING</Text>
          </View>
        </View>
        <MaterialIcons name="unfold-more" size={20} color={theme.colors.textTertiary} />
      </Pressable>
      <AccountSwitcher visible={open} onClose={() => setOpen(false)} />
    </View>
  );
};

export const AdminNavigator = () => {
  const theme = useAppTheme();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties, setActiveSocietyId } = useLocalAppState();

  const society = allSocieties.find((s) => s.id === selectedAdminSocietyId);
  const brand = society?.primaryColor || theme.colors.primary;

  // Keep the loaded-data pointer (activeSocietyId) locked to the account we're managing.
  // Switching accounts sets selectedAdminSocietyId; this is the single seam that makes
  // the society tab world's content follow the active account, from any entry point.
  useEffect(() => {
    if (selectedAdminSocietyId) {
      setActiveSocietyId(selectedAdminSocietyId);
    }
  }, [selectedAdminSocietyId, setActiveSocietyId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AccountBar brand={brand} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...getTabNavigatorOptions(theme),
          tabBarActiveTintColor: brand,
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
  barInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minHeight: 56 },
  avatarRing: { padding: 2, borderRadius: 999, borderWidth: 2 },
  barText: { flex: 1, gap: 1 },
  managingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
