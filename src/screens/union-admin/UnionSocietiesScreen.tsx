import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import {
  approveUnionSociety,
  getUnionSocieties,
  rejectUnionSociety,
  UnionSocietyListItem,
} from '@/services/api/union-admin';
import { SocietyRegistrationStatus } from '@/types/union-admin';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { ScreenLayout } from '../ScreenLayout';

const FILTERS: { label: string; status: SocietyRegistrationStatus }[] = [
  { label: 'Pending', status: 'PENDING' },
  { label: 'Approved', status: 'APPROVED' },
  { label: 'Rejected', status: 'REJECTED' },
];

const PAGE_SIZE = 20;

export const UnionSocietiesScreen = () => {
  const theme = useAppTheme();
  const { selectedUniversityId, unionAdminRelationships } = useUserRoles();

  const [statusFilter, setStatusFilter] = useState<SocietyRegistrationStatus>('PENDING');
  const [societies, setSocieties] = useState<UnionSocietyListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actingSocietyId, setActingSocietyId] = useState<string | null>(null);
  const [rejectingSocietyId, setRejectingSocietyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const selectedUniversity = unionAdminRelationships.find(
    (entry) => entry.universityId === selectedUniversityId,
  );

  const loadSocieties = useCallback(async () => {
    if (!selectedUniversityId) {
      return;
    }
    try {
      const page = await getUnionSocieties(selectedUniversityId, {
        status: statusFilter,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setSocieties(page.items);
      setTotal(page.total);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to load societies. Pull down to retry.');
    }
  }, [selectedUniversityId, statusFilter]);

  useEffect(() => {
    setIsLoading(true);
    setRejectingSocietyId(null);
    setRejectReason('');
    loadSocieties().finally(() => setIsLoading(false));
  }, [loadSocieties]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSocieties();
    setRefreshing(false);
  };

  const handleApprove = (society: UnionSocietyListItem) => {
    Alert.alert('Approve Society', `Approve ${society.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          if (!selectedUniversityId) {
            return;
          }
          setActingSocietyId(society.id);
          try {
            await approveUnionSociety(society.id, selectedUniversityId);
            await loadSocieties();
          } catch {
            Alert.alert('Error', 'Failed to approve this society. Please try again.');
          } finally {
            setActingSocietyId(null);
          }
        },
      },
    ]);
  };

  const handleConfirmReject = async (society: UnionSocietyListItem) => {
    if (!selectedUniversityId) {
      return;
    }
    setActingSocietyId(society.id);
    try {
      await rejectUnionSociety(society.id, selectedUniversityId, rejectReason.trim() || undefined);
      setRejectingSocietyId(null);
      setRejectReason('');
      await loadSocieties();
    } catch {
      Alert.alert('Error', 'Failed to reject this society. Please try again.');
    } finally {
      setActingSocietyId(null);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        <TopNavBar title="Societies" subtitle={selectedUniversity?.universityName} />

        {/* Status Filter */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map((filter) => (
              <Pressable key={filter.status} onPress={() => setStatusFilter(filter.status)}>
                <BadgeChip
                  label={filter.label}
                  variant={statusFilter === filter.status ? 'filled' : 'outlined'}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader
            title={`${FILTERS.find((filter) => filter.status === statusFilter)?.label} Societies`}
            rightText={`${total} total`}
          />

          {isLoading ? (
            <LoadingState />
          ) : errorMessage ? (
            <EmptyState title="Something went wrong" subtitle={errorMessage} />
          ) : societies.length === 0 ? (
            <EmptyState
              title={`No ${statusFilter.toLowerCase()} societies`}
              subtitle={
                statusFilter === 'PENDING'
                  ? 'New society registrations awaiting review will appear here.'
                  : `Societies you have ${statusFilter.toLowerCase()} will appear here.`
              }
            />
          ) : (
            <View style={{ gap: 12, marginTop: 12 }}>
              {societies.map((society) => {
                const isActing = actingSocietyId === society.id;
                const isRejecting = rejectingSocietyId === society.id;

                return (
                  <Card key={society.id}>
                    <View style={{ gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
                            {society.name}
                          </Text>
                          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                            {society.shortName} • {society._count.memberships} members
                          </Text>
                        </View>
                        <BadgeChip label={society.registrationStatus.toLowerCase()} variant="outlined" />
                      </View>

                      {society.description ? (
                        <Text
                          style={{ fontSize: 14, color: theme.colors.textPrimary, lineHeight: 20 }}
                          numberOfLines={3}
                        >
                          {society.description}
                        </Text>
                      ) : null}

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialIcons name="person" size={14} color={theme.colors.textSecondary} />
                        <Text style={{ fontSize: 13, color: theme.colors.textSecondary, flex: 1 }} numberOfLines={1}>
                          {society.requestedBy
                            ? `Requested by ${society.requestedBy.fullName} (${society.requestedBy.email})`
                            : 'Requester unknown'}
                          {' • '}
                          {new Date(society.createdAt).toLocaleDateString()}
                        </Text>
                      </View>

                      {society.registrationStatus === 'PENDING' && !isRejecting ? (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <OutlineButton
                              label="Reject"
                              onPress={() => {
                                setRejectingSocietyId(society.id);
                                setRejectReason('');
                              }}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <PrimaryButton
                              label={isActing ? 'Approving...' : 'Approve'}
                              onPress={() => handleApprove(society)}
                              disabled={isActing}
                            />
                          </View>
                        </View>
                      ) : null}

                      {isRejecting ? (
                        <View style={{ gap: 12 }}>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                              borderRadius: 8,
                              backgroundColor: theme.colors.surface,
                              color: theme.colors.textPrimary,
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              minHeight: 72,
                              textAlignVertical: 'top',
                            }}
                            multiline
                            placeholder="Reason for rejection (optional)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            maxLength={500}
                          />
                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                              <OutlineButton
                                label="Cancel"
                                onPress={() => {
                                  setRejectingSocietyId(null);
                                  setRejectReason('');
                                }}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <PrimaryButton
                                label={isActing ? 'Rejecting...' : 'Confirm Reject'}
                                onPress={() => handleConfirmReject(society)}
                                disabled={isActing}
                              />
                            </View>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};
