import React, { useState, useEffect } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCommitteeRequests } from '@/hooks/useCommitteeRequests';
import { useUserRoles } from '@/hooks/useUserRoles';
import { CommitteeRequestStatus } from '@/types/union-admin';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { LoadingState } from '@/components/LoadingState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from '../ScreenLayout';

type FilterStatus = 'ALL' | CommitteeRequestStatus;

const FILTER_ITEMS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];

const STATUS_CHIP_VARIANT: Record<CommitteeRequestStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'neutral',
};

export const CommitteeRequestsScreen = () => {
  const theme = useAppTheme();
  const toast = useToast();
  const { selectedUniversityId, unionAdminRelationships } = useUserRoles();
  const {
    universityRequests,
    isLoadingUniversityRequests,
    totalUniversityRequests,
    requestStats,
    loadUniversityRequests,
    approveRequest,
    rejectRequest,
    bulkApprove,
    bulkReject,
    refreshStats,
  } = useCommitteeRequests();

  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const selectedUniversity = unionAdminRelationships.find(u => u.universityId === selectedUniversityId);

  useEffect(() => {
    if (selectedFilter === 'ALL') {
      loadUniversityRequests();
    } else {
      loadUniversityRequests({ status: selectedFilter });
    }
  }, [selectedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUniversityRequests(selectedFilter === 'ALL' ? {} : { status: selectedFilter }),
      refreshStats(),
    ]);
    setRefreshing(false);
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest(requestId);
      toast.show('Committee request approved', 'success');
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    } catch (error) {
      toast.show('Failed to approve request', 'error');
    }
  };

  const handleReject = async (requestId: string) => {
    Alert.prompt(
      'Reject Request',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (reason) {
          try {
            await rejectRequest(requestId, reason);
            toast.show('Committee request rejected', 'success');
            setSelectedRequests(prev => prev.filter(id => id !== requestId));
          } catch (error) {
            toast.show('Failed to reject request', 'error');
          }
        }
      }
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;

    Alert.alert(
      'Bulk Approve',
      `Approve ${selectedRequests.length} selected requests?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await bulkApprove(selectedRequests);
              toast.show(`${selectedRequests.length} requests approved`, 'success');
              setSelectedRequests([]);
            } catch (error) {
              toast.show('Failed to approve some requests', 'error');
            }
          }
        }
      ]
    );
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) return;

    Alert.prompt(
      'Bulk Reject',
      `Provide reason for rejecting ${selectedRequests.length} requests:`,
      async (reason) => {
        if (reason) {
          try {
            await bulkReject(selectedRequests, reason);
            toast.show(`${selectedRequests.length} requests rejected`, 'success');
            setSelectedRequests([]);
          } catch (error) {
            toast.show('Failed to reject some requests', 'error');
          }
        }
      }
    );
  };

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const filteredRequests = universityRequests.filter(request =>
    !searchQuery ||
    request.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.society?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenLayout scroll={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.textTertiary} />
        }
      >
        <TopNavBar title="Committee Requests" subtitle={selectedUniversity?.universityName} />

        {/* Stats overview */}
        {requestStats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <StatCard label="Pending" value={requestStats.pending} icon="hourglass-empty" />
            </View>
            <View style={styles.statCell}>
              <StatCard label="Approved" value={requestStats.approved} icon="check-circle" />
            </View>
            <View style={styles.statCell}>
              <StatCard label="Rejected" value={requestStats.rejected} icon="block" />
            </View>
          </View>
        )}

        {/* Search and filters */}
        <SearchBar
          placeholder="Search by student or society name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FilterChips
          items={FILTER_ITEMS.map((item) => item.label)}
          onChange={(label) => {
            const match = FILTER_ITEMS.find((item) => item.label === label);
            if (match) {
              setSelectedFilter(match.value);
            }
          }}
        />

        {/* Bulk actions */}
        {selectedRequests.length > 0 && (
          <Card style={{ borderColor: theme.colors.primary }}>
            <View style={styles.bulkRow}>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, flex: 1 }]}>
                {selectedRequests.length} selected
              </Text>
              <PrimaryButton label="Reject" variant="ghost" size="sm" onPress={handleBulkReject} />
              <PrimaryButton label="Approve" size="sm" onPress={handleBulkApprove} />
            </View>
          </Card>
        )}

        {/* Requests list */}
        <View style={styles.listWrap}>
          <SectionHeader
            title="Requests"
            rightText={`${filteredRequests.length} of ${totalUniversityRequests}`}
          />

          {isLoadingUniversityRequests && filteredRequests.length === 0 ? (
            <LoadingState />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No requests found"
              subtitle={searchQuery ? 'Try adjusting your search terms.' : 'All committee requests will appear here.'}
              actionLabel={searchQuery ? 'Clear search' : undefined}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
            />
          ) : (
            <View style={styles.cardList}>
              {filteredRequests.map((request) => {
                const isSelected = selectedRequests.includes(request.id);
                return (
                  <Card key={request.id} style={isSelected ? { borderColor: theme.colors.primary } : undefined}>
                    <View style={styles.cardBody}>
                      <View style={styles.cardHeader}>
                        {/* Selection checkbox */}
                        <Pressable
                          onPress={() => toggleRequestSelection(request.id)}
                          hitSlop={12}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isSelected }}
                          style={[
                            styles.checkbox,
                            {
                              borderRadius: theme.radius.sm,
                              borderColor: isSelected ? theme.colors.primary : theme.colors.borderStrong,
                              backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                            }
                          ]}
                        >
                          {isSelected && (
                            <MaterialIcons name="check" size={14} color={theme.colors.textOnPrimary} />
                          )}
                        </Pressable>

                        <Avatar name={request.user?.fullName ?? '?'} size={44} />

                        <View style={styles.cardTitleWrap}>
                          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                            {request.user?.fullName}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {request.society?.name} • {request.currentRole} → {request.requestedRole}
                          </Text>
                        </View>

                        <View style={styles.statusWrap}>
                          <BadgeChip
                            label={request.status.toLowerCase()}
                            variant={STATUS_CHIP_VARIANT[request.status] ?? 'neutral'}
                          />
                          <Text style={[theme.typography.caption, styles.dateText, { color: theme.colors.textTertiary }]}>
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      {request.justification && (
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]} numberOfLines={4}>
                          {request.justification}
                        </Text>
                      )}

                      {request.status === 'PENDING' && (
                        <View style={styles.actionRow}>
                          <PrimaryButton
                            label="Reject"
                            variant="ghost"
                            size="sm"
                            onPress={() => handleReject(request.id)}
                          />
                          <PrimaryButton
                            label="Approve"
                            size="sm"
                            onPress={() => handleApprove(request.id)}
                          />
                        </View>
                      )}

                      {request.reviewerComments && (
                        <View
                          style={[
                            styles.commentBox,
                            { backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.sm }
                          ]}
                        >
                          <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
                            Admin comment
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textPrimary }]}>
                            {request.reviewerComments}
                          </Text>
                        </View>
                      )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCell: {
    flexGrow: 1,
    flexBasis: '28%'
  },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
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
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2
  },
  statusWrap: {
    alignItems: 'flex-end',
    gap: 4
  },
  dateText: {
    fontSize: 11,
    lineHeight: 14
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  commentBox: {
    padding: 12,
    gap: 4
  }
});
