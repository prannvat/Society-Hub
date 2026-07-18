import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from '../ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * The society's own profile, Instagram-style, shown when you're acting AS the society.
 * Doubles as the management anchor: Edit, insights, and a grid of the society's posts.
 */
export const SocietyAccountProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties, announcements, events, polls, activeSocietyMemberCount } = useLocalAppState();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const societyId = selectedAdminSocietyId ?? '';
  const society = allSocieties.find((s) => s.id === societyId);
  const brandPrimary = society?.primaryColor || theme.colors.primary;
  const brandSecondary = society?.secondaryColor || brandPrimary;

  const stat = (label: string, value: number) => (
    <View style={styles.stat}>
      <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <ScreenLayout>
      {/* Account bar — tap to switch accounts, IG-style */}
      <Pressable style={styles.accountBar} onPress={() => setSwitcherOpen(true)}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {society?.shortName || society?.name}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={theme.colors.textPrimary} />
      </Pressable>

      <LinearGradient colors={[brandPrimary, brandSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.band, { borderRadius: theme.radius.lg }]} />

      <View style={styles.body}>
        <View style={styles.identity}>
          <View style={[styles.avatarRing, { backgroundColor: theme.colors.background }]}>
            <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={72} />
          </View>
          <View style={styles.stats}>
            {stat('Members', activeSocietyMemberCount)}
            {stat('Events', events.length)}
            {stat('Posts', announcements.length)}
          </View>
        </View>

        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{society?.name ?? 'Society'}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{society?.university}</Text>
        {society?.description ? (
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginTop: spacing.xs }]}>{society.description}</Text>
        ) : null}

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Edit profile" variant="secondary" size="md" icon="edit" onPress={() => navigation.navigate('EditSocietyProfile')} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Create" size="md" icon="add" onPress={() => navigation.navigate('CreateHub', { societyId })} />
          </View>
        </View>

        {/* Posts grid preview */}
        <Text style={[theme.typography.micro, { color: theme.colors.textTertiary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>RECENT POSTS</Text>
        <View style={styles.grid}>
          {announcements.slice(0, 6).map((a) => (
            <Pressable
              key={a.id}
              onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: a.id })}
              style={[styles.tile, { backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.sm }]}
            >
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]} numberOfLines={4}>
                {a.title}
              </Text>
            </Pressable>
          ))}
          {announcements.length === 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>No posts yet — tap Create to publish your first.</Text>
          ) : null}
        </View>
      </View>

      <AccountSwitcher visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  accountBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.sm },
  band: { height: 72, marginHorizontal: spacing.lg },
  body: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.xxl },
  identity: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg, marginTop: -32 },
  avatarRing: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: spacing.xs },
  stat: { alignItems: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '31.5%', aspectRatio: 1, padding: spacing.sm },
});
