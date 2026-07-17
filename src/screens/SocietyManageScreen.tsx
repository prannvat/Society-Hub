import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { StatCard } from '@/components/StatCard';
import { TopNavBar } from '@/components/TopNavBar';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ActionIcon = ({ name, tint }: { name: keyof typeof MaterialIcons.glyphMap; tint: string }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm }]}>
      <MaterialIcons name={name} size={20} color={tint} />
    </View>
  );
};

/**
 * Per-society management hub — the committee's home for one society. Reached
 * contextually from the society profile, so admins never leave the student app.
 */
export const SocietyManageScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocietyManage'>>();
  const societyId = route.params.societyId;
  const { allSocieties, setActiveSocietyId, activeSocietyMemberCount, events, polls, announcements } = useLocalAppState();

  const society = allSocieties.find((s) => s.id === societyId);
  const brandPrimary = society?.primaryColor || theme.colors.primary;
  const brandSecondary = society?.secondaryColor || brandPrimary;

  useEffect(() => {
    setActiveSocietyId(societyId);
  }, [societyId, setActiveSocietyId]);

  const create = (screen: 'CreatePost' | 'CreateEvent' | 'CreatePoll') => {
    setActiveSocietyId(societyId);
    navigation.navigate(screen, { societyId });
  };

  return (
    <ScreenLayout>
      <TopNavBar title="Manage" subtitle={society?.name} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        {/* Brand-tinted identity header */}
        <View style={styles.identityWrap}>
          <LinearGradient
            colors={[brandPrimary, brandSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.brandBand, { borderRadius: theme.radius.lg }]}
          />
          <View style={styles.identityRow}>
            <View style={[styles.avatarRing, { backgroundColor: theme.colors.background }]}>
              <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={56} />
            </View>
            <View style={styles.identityText}>
              <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {society?.name ?? 'Society'}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Committee dashboard
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <StatCard label="Members" value={String(activeSocietyMemberCount)} icon="group" />
          </View>
          <View style={styles.statCell}>
            <StatCard label="Events" value={String(events.length)} icon="event" />
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <StatCard label="Posts" value={String(announcements.length)} icon="campaign" />
          </View>
          <View style={styles.statCell}>
            <StatCard label="Polls" value={String(polls.length)} icon="how-to-vote" />
          </View>
        </View>

        <Text style={[theme.typography.micro, styles.section, { color: theme.colors.textSecondary }]}>CREATE</Text>
        <Card padding={0}>
          <ListRow
            title="Post an update"
            subtitle="Announcements & news"
            leading={<ActionIcon name="campaign" tint={theme.colors.primary} />}
            chevron
            onPress={() => create('CreatePost')}
          />
          <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
          <ListRow
            title="Create an event"
            subtitle="Date, location, RSVPs"
            leading={<ActionIcon name="event" tint={theme.colors.primary} />}
            chevron
            onPress={() => create('CreateEvent')}
          />
          <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
          <ListRow
            title="Run a poll"
            subtitle="Ask your members"
            leading={<ActionIcon name="how-to-vote" tint={theme.colors.primary} />}
            chevron
            onPress={() => create('CreatePoll')}
          />
        </Card>

        <Text style={[theme.typography.micro, styles.section, { color: theme.colors.textSecondary }]}>MANAGE</Text>
        <Card padding={0}>
          <ListRow
            title="Members & requests"
            subtitle="Approve joins, assign roles"
            leading={<ActionIcon name="groups" tint={theme.colors.primary} />}
            chevron
            onPress={() => navigation.navigate('MembersDirectory', { societyId })}
          />
          <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
          <ListRow
            title="Edit society profile"
            subtitle="Logo, description, links"
            leading={<ActionIcon name="edit" tint={theme.colors.primary} />}
            chevron
            onPress={() => navigation.navigate('EditSocietyProfile')}
          />
          <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
          <ListRow
            title="View public profile"
            subtitle="See what members see"
            leading={<ActionIcon name="visibility" tint={theme.colors.primary} />}
            chevron
            onPress={() => navigation.navigate('SocietyProfile', { societyId })}
          />
        </Card>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  identityWrap: { marginBottom: spacing.sm },
  brandBand: { height: 64 },
  identityRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, marginTop: -28, paddingHorizontal: spacing.xs },
  avatarRing: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  identityText: { flex: 1, paddingBottom: spacing.xs, gap: 2 },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCell: { flex: 1 },
  section: { marginTop: spacing.lg, marginBottom: spacing.xs },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 68 },
});
