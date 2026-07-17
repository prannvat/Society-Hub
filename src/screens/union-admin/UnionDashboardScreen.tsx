import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getUniversityAnalytics, UniversityAnalytics } from '@/services/api/union-admin';
import type { UnionAdminTabParamList } from '@/navigation/UnionAdminNavigator';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { RoleSwitcher } from '@/components/RoleSwitcher';
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

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Union Dashboard
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 4 }}>
                {selectedUniversity?.universityName ?? 'University'}
              </Text>
            </View>
            <RoleSwitcher compact />
          </View>
        </View>

        {isLoading ? (
          <LoadingState />
        ) : errorMessage ? (
          <EmptyState title="Something went wrong" subtitle={errorMessage} />
        ) : !analytics ? (
          <EmptyState title="No analytics yet" subtitle="Analytics will appear once your university has activity." />
        ) : (
          <>
            {/* Students */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <SectionHeader title="Students" />
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                <View style={{ flexGrow: 1, flexBasis: 100 }}>
                  <StatCard label="Total" value={analytics.users.total} />
                </View>
                <View style={{ flexGrow: 1, flexBasis: 100 }}>
                  <StatCard label="Verified" value={analytics.users.verified} />
                </View>
                <View style={{ flexGrow: 1, flexBasis: 100 }}>
                  <StatCard label="Verification Rate" value={formatRate(analytics.users.verificationRate)} />
                </View>
              </View>
            </View>

            {/* Approvals */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <SectionHeader title="Approvals" />
              <View style={{ gap: 12, marginTop: 12 }}>
                <Pressable onPress={() => navigation.navigate('Societies')}>
                  <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <MaterialIcons name="groups" size={24} color={theme.colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>
                          Societies
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                          {analytics.societies.total} total
                        </Text>
                      </View>
                      {analytics.societies.pending > 0 ? (
                        <View
                          style={{
                            backgroundColor: theme.colors.warning,
                            borderRadius: 100,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ color: theme.colors.background, fontWeight: '700', fontSize: 12 }}>
                            {analytics.societies.pending} pending
                          </Text>
                        </View>
                      ) : null}
                      <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                    </View>
                  </Card>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Requests')}>
                  <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <MaterialIcons name="approval" size={24} color={theme.colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>
                          Committee Requests
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                          {analytics.committeeRequests.total} total
                        </Text>
                      </View>
                      {analytics.committeeRequests.pending > 0 ? (
                        <View
                          style={{
                            backgroundColor: theme.colors.warning,
                            borderRadius: 100,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ color: theme.colors.background, fontWeight: '700', fontSize: 12 }}>
                            {analytics.committeeRequests.pending} pending
                          </Text>
                        </View>
                      ) : null}
                      <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                    </View>
                  </Card>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};
