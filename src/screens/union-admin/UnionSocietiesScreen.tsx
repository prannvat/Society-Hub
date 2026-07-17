import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { InputField } from '@/components/InputField';
import { LoadingState } from '@/components/LoadingState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from '../ScreenLayout';

const FILTERS: { label: string; status: SocietyRegistrationStatus }[] = [
  { label: 'Pending', status: 'PENDING' },
  { label: 'Approved', status: 'APPROVED' },
  { label: 'Rejected', status: 'REJECTED' },
];

const STATUS_CHIP_VARIANT: Record<SocietyRegistrationStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  REQUIRES_CHANGES: 'neutral',
};

const PAGE_SIZE = 20;

export const UnionSocietiesScreen = () => {
  const theme = useAppTheme();
  const toast = useToast();
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
            toast.show(`${society.name} approved`, 'success');
          } catch {
            toast.show('Failed to approve this society. Please try again.', 'error');
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
      toast.show(`${society.name} rejected`, 'success');
    } catch {
      toast.show('Failed to reject this society. Please try again.', 'error');
    } finally {
      setActingSocietyId(null);
    }
  };

  const activeFilterLabel = FILTERS.find((filter) => filter.status === statusFilter)?.label ?? 'Pending';

  return (
    <ScreenLayout scroll={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.textTertiary} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <TopNavBar title="Societies" subtitle={selectedUniversity?.universityName} />

        {/* Status filter */}
        <FilterChips
          items={FILTERS.map((filter) => filter.label)}
          onChange={(label) => {
            const match = FILTERS.find((filter) => filter.label === label);
            if (match) {
              setStatusFilter(match.status);
            }
          }}
        />

        <View style={styles.listWrap}>
          <SectionHeader title={`${activeFilterLabel} societies`} rightText={`${total} total`} />

          {isLoading ? (
            <LoadingState />
          ) : errorMessage ? (
            <EmptyState icon="cloud-off" title="Something went wrong" subtitle={errorMessage} />
          ) : societies.length === 0 ? (
            <EmptyState
              icon={statusFilter === 'PENDING' ? 'inbox' : statusFilter === 'APPROVED' ? 'check-circle-outline' : 'block'}
              title={`No ${statusFilter.toLowerCase()} societies`}
              subtitle={
                statusFilter === 'PENDING'
                  ? 'New society registrations awaiting review will appear here.'
                  : `Societies you have ${statusFilter.toLowerCase()} will appear here.`
              }
            />
          ) : (
            <View style={styles.cardList}>
              {societies.map((society) => {
                const isActing = actingSocietyId === society.id;
                const isRejecting = rejectingSocietyId === society.id;

                return (
                  <Card key={society.id}>
                    <View style={styles.cardBody}>
                      <View style={styles.cardHeader}>
                        <Avatar name={society.name} size={44} />
                        <View style={styles.cardTitleWrap}>
                          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                            {society.name}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {society.shortName} • {society._count.memberships}{' '}
                            {society._count.memberships === 1 ? 'member' : 'members'}
                          </Text>
                        </View>
                        <BadgeChip
                          label={society.registrationStatus.toLowerCase()}
                          variant={STATUS_CHIP_VARIANT[society.registrationStatus]}
                        />
                      </View>

                      {society.description ? (
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                          {society.description}
                        </Text>
                      ) : null}

                      <View style={styles.requesterRow}>
                        <MaterialIcons name="person-outline" size={14} color={theme.colors.textTertiary} />
                        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, flex: 1 }]} numberOfLines={1}>
                          {society.requestedBy
                            ? `Requested by ${society.requestedBy.fullName}`
                            : 'Requester unknown'}
                          {' • '}
                          {new Date(society.createdAt).toLocaleDateString()}
                        </Text>
                      </View>

                      {society.registrationStatus === 'PENDING' && !isRejecting ? (
                        <View style={styles.actionRow}>
                          <PrimaryButton
                            label="Reject"
                            variant="ghost"
                            size="sm"
                            disabled={isActing}
                            onPress={() => {
                              setRejectingSocietyId(society.id);
                              setRejectReason('');
                            }}
                          />
                          <PrimaryButton
                            label="Approve"
                            size="sm"
                            loading={isActing}
                            onPress={() => handleApprove(society)}
                          />
                        </View>
                      ) : null}

                      {isRejecting ? (
                        <View style={styles.rejectWrap}>
                          <InputField
                            label="Reason for rejection"
                            placeholder="Optional — shared with the requester"
                            value={rejectReason}
                            onChangeText={(value) => {
                              if (value.length <= 500) {
                                setRejectReason(value);
                              }
                            }}
                            multiline
                          />
                          <View style={styles.actionRow}>
                            <PrimaryButton
                              label="Cancel"
                              variant="ghost"
                              size="sm"
                              disabled={isActing}
                              onPress={() => {
                                setRejectingSocietyId(null);
                                setRejectReason('');
                              }}
                            />
                            <PrimaryButton
                              label="Confirm reject"
                              variant="danger"
                              size="sm"
                              loading={isActing}
                              onPress={() => handleConfirmReject(society)}
                            />
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 96,
    gap: 16
  },
  listWrap: {
    gap: 12
  },
  cardList: {
    gap: 12
  },
  cardBody: {
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  rejectWrap: {
    gap: 12
  }
});
