import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

const ManageIcon = ({ name, tone }: { name: keyof typeof MaterialIcons.glyphMap; tone?: string }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.icon, { backgroundColor: tone ?? theme.colors.primarySoft }]}>
      <MaterialIcons name={name} size={20} color={theme.colors.primary} />
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
        <View style={styles.identity}>
          <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {society?.name ?? 'Society'}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Committee dashboard</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={{ flex: 1 }}>
            <StatCard label="Members" value={String(activeSocietyMemberCount)} icon="group" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="Events" value={String(events.length)} icon="event" />
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={{ flex: 1 }}>
            <StatCard label="Posts" value={String(announcements.length)} icon="campaign" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="Polls" value={String(polls.length)} icon="how-to-vote" />
          </View>
        </View>

        <Text style={[theme.typography.micro, styles.section, { color: theme.colors.textSecondary }]}>CREATE</Text>
        <Card padding={0}>
          <ListRow title="Post an update" leading={<ManageIcon name="campaign" />} chevron onPress={() => create('CreatePost')} />
          <ListRow title="Create an event" leading={<ManageIcon name="event" />} chevron onPress={() => create('CreateEvent')} />
          <ListRow title="Run a poll" leading={<ManageIcon name="how-to-vote" />} chevron onPress={() => create('CreatePoll')} />
        </Card>

        <Text style={[theme.typography.micro, styles.section, { color: theme.colors.textSecondary }]}>MANAGE</Text>
        <Card padding={0}>
          <ListRow
            title="Members & requests"
            leading={<ManageIcon name="groups" />}
            chevron
            onPress={() => navigation.navigate('MembersDirectory', { societyId })}
          />
          <ListRow
            title="Edit society profile"
            leading={<ManageIcon name="edit" />}
            chevron
            onPress={() => navigation.navigate('EditSocietyProfile')}
          />
          <ListRow
            title="View public profile"
            leading={<ManageIcon name="visibility" />}
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
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  section: { marginTop: spacing.lg, marginBottom: spacing.xs },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
