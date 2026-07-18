import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { RootStackParamList } from '@/navigation/types';
import { fetchMembershipRequests } from '@/services/api/memberships';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useLocalAppState } from '@/hooks/useLocalAppState';

export const AdminDashboardScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedAdminSocietyId, adminSocieties } = useUserRoles();
  const { allSocieties, events, announcements, polls, activeSocietyMemberCount } = useLocalAppState();

  const [pendingRequestCount, setPendingRequestCount] = useState<number | null>(null);

  const selectedSociety = adminSocieties.find(s => s.societyId === selectedAdminSocietyId);
  const societyDetails = allSocieties.find(s => s.id === selectedAdminSocietyId);

  const loadPendingRequests = useCallback(async () => {
    if (!selectedAdminSocietyId) {
      return;
    }
    try {
      const requests = await fetchMembershipRequests(selectedAdminSocietyId);
      setPendingRequestCount(requests.filter((request) => request.status === 'PENDING').length);
    } catch {
      setPendingRequestCount(null);
    }
  }, [selectedAdminSocietyId]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  if (!selectedSociety || !societyDetails) {
    return (
      <ScreenLayout scroll={false}>
        <View style={styles.centerWrap}>
          <EmptyState
            icon="admin-panel-settings"
            title="No society selected"
            subtitle="Select a society to manage from the mode switcher above."
          />
        </View>
      </ScreenLayout>
    );
  }

  const now = Date.now();
  const upcomingEventCount = events.filter((event) => {
    const start = event.startAtIso ? new Date(event.startAtIso).getTime() : NaN;
    return Number.isNaN(start) ? true : start >= now;
  }).length;

  const quickActions: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    onPress: () => void;
  }[] = [
    { icon: 'event', label: 'Create event', onPress: () => navigation.navigate('CreateEvent') },
    { icon: 'post-add', label: 'New post', onPress: () => navigation.navigate('AnnouncementsFeed') },
    { icon: 'poll', label: 'New poll', onPress: () => navigation.navigate('CreatePoll', undefined) },
    { icon: 'edit', label: 'Edit profile', onPress: () => navigation.navigate('EditSocietyProfile') }
  ];

  return (
    <ScreenLayout>
      <View style={styles.page}>
        <ScreenHeader
          title="Dashboard"
          subtitle={societyDetails.name}
          accessory={<RoleSwitcher compact showModeText={false} />}
        />

        {/* Key metrics — all real values from local app state */}
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <StatCard label="Members" value={activeSocietyMemberCount} icon="groups" />
          </View>
          <View style={styles.statCell}>
            <StatCard label="Upcoming events" value={upcomingEventCount} icon="event" />
          </View>
          <View style={styles.statCell}>
            <StatCard label="Posts" value={announcements.length} icon="article" />
          </View>
          <View style={styles.statCell}>
            <StatCard label="Polls" value={polls.length} icon="poll" />
          </View>
        </View>

        {/* Needs attention */}
        <View style={styles.section}>
          <SectionHeader title="Needs attention" />
          <Card
            onPress={() => navigation.navigate('MainTabs', { screen: 'Members' })}
            style={
              pendingRequestCount !== null && pendingRequestCount > 0
                ? { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningSoft }
                : undefined
            }
          >
            <View style={styles.attentionRow}>
              <View
                style={[
                  styles.attentionIcon,
                  {
                    backgroundColor:
                      pendingRequestCount !== null && pendingRequestCount > 0
                        ? theme.colors.warningSoft
                        : theme.colors.primarySoft
                  }
                ]}
              >
                <MaterialIcons
                  name="person-add"
                  size={20}
                  color={pendingRequestCount !== null && pendingRequestCount > 0 ? theme.colors.warning : theme.colors.primary}
                />
              </View>
              <View style={styles.attentionText}>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                  Membership requests
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  {pendingRequestCount === null
                    ? 'Review join requests'
                    : pendingRequestCount === 0
                      ? 'No pending approvals'
                      : `${pendingRequestCount} pending ${pendingRequestCount === 1 ? 'approval' : 'approvals'}`}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={theme.colors.textTertiary} />
            </View>
          </Card>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick actions" />
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <View key={action.label} style={styles.actionCell}>
                <Card onPress={action.onPress}>
                  <View style={styles.actionContent}>
                    <View style={[styles.actionIcon, { backgroundColor: theme.colors.primarySoft }]}>
                      <MaterialIcons name={action.icon} size={22} color={theme.colors.primary} />
                    </View>
                    <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {action.label}
                    </Text>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    justifyContent: 'center'
  },
  page: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 24
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCell: {
    flexGrow: 1,
    flexBasis: '44%'
  },
  section: {
    gap: 12
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44
  },
  attentionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  attentionText: {
    flex: 1,
    gap: 2
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionCell: {
    flexGrow: 1,
    flexBasis: '44%'
  },
  actionContent: {
    alignItems: 'flex-start',
    gap: 10
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
