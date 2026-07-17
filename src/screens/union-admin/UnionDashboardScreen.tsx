import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getUniversityAnalytics, UniversityAnalytics } from '@/services/api/union-admin';
import type { UnionAdminTabParamList } from '@/navigation/UnionAdminNavigator';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { ScreenLayout } from '../ScreenLayout';

const formatRate = (verificationRate: number) => {
  // Normalise whether the API reports a fraction (0-1) or a percentage (0-100).
  const percentage = verificationRate <= 1 ? verificationRate * 100 : verificationRate;
  return `${Math.round(percentage)}%`;
};

export const UnionDashboardScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<UnionAdminTabParamList>>();
  const { selectedUniversityId, unionAdminRelationships } = useUserRoles();

  const [analytics, setAnalytics] = useState<UniversityAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedUniversity = unionAdminRelationships.find(
    (entry) => entry.universityId === selectedUniversityId,
  );

  const loadAnalytics = useCallback(async () => {
    if (!selectedUniversityId) {
      return;
    }
    try {
      const data = await getUniversityAnalytics(selectedUniversityId);
      setAnalytics(data);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to load university analytics. Pull down to retry.');
    }
  }, [selectedUniversityId]);

  useEffect(() => {
    setIsLoading(true);
    loadAnalytics().finally(() => setIsLoading(false));
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const renderAttentionCard = ({
    icon,
    title,
    totalLabel,
    pending,
    onPress
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    totalLabel: string;
    pending: number;
    onPress: () => void;
  }) => (
    <Card
      onPress={onPress}
      style={pending > 0 ? { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningSoft } : undefined}
    >
      <View style={styles.attentionRow}>
        <View
          style={[
            styles.attentionIcon,
            { backgroundColor: pending > 0 ? theme.colors.warningSoft : theme.colors.primarySoft }
          ]}
        >
          <MaterialIcons name={icon} size={20} color={pending > 0 ? theme.colors.warning : theme.colors.primary} />
        </View>
        <View style={styles.attentionText}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{title}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{totalLabel}</Text>
        </View>
        {pending > 0 ? <BadgeChip label={`${pending} pending`} variant="warning" /> : null}
        <MaterialIcons name="chevron-right" size={22} color={theme.colors.textTertiary} />
      </View>
    </Card>
  );

  return (
    <ScreenLayout scroll={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.textTertiary} />
        }
      >
        <ScreenHeader
          gutter={false}
          title="Union Dashboard"
          subtitle={selectedUniversity?.universityName ?? 'University'}
          accessory={<RoleSwitcher compact showModeText={false} />}
        />

        {isLoading ? (
          <LoadingState />
        ) : errorMessage ? (
          <EmptyState icon="cloud-off" title="Something went wrong" subtitle={errorMessage} />
        ) : !analytics ? (
          <EmptyState
            icon="insights"
            title="No analytics yet"
            subtitle="Analytics will appear once your university has activity."
          />
        ) : (
          <>
            {/* Students */}
            <View style={styles.section}>
              <SectionHeader title="Students" />
              <View style={styles.statsGrid}>
                <View style={styles.statCell}>
                  <StatCard label="Students" value={analytics.users.total} icon="school" />
                </View>
                <View style={styles.statCell}>
                  <StatCard label="Verified" value={analytics.users.verified} icon="verified" />
                </View>
                <View style={styles.statCell}>
                  <StatCard
                    label="Verification rate"
                    value={formatRate(analytics.users.verificationRate)}
                    icon="fact-check"
                  />
                </View>
                <View style={styles.statCell}>
                  <StatCard label="Societies" value={analytics.societies.total} icon="groups" />
                </View>
              </View>
            </View>

            {/* Approvals */}
            <View style={styles.section}>
              <SectionHeader title="Needs attention" />
              <View style={styles.attentionList}>
                {renderAttentionCard({
                  icon: 'groups',
                  title: 'Societies',
                  totalLabel: `${analytics.societies.total} total`,
                  pending: analytics.societies.pending,
                  onPress: () => navigation.navigate('Societies')
                })}
                {renderAttentionCard({
                  icon: 'approval',
                  title: 'Committee requests',
                  totalLabel: `${analytics.committeeRequests.total} total`,
                  pending: analytics.committeeRequests.pending,
                  onPress: () => navigation.navigate('Requests')
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 24
  },
  section: {
    gap: 12
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
  attentionList: {
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
  }
});
