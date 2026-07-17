import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCommitteeRequests } from '@/hooks/useCommitteeRequests';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { CommitteeRequestStatus } from '@/types/union-admin';
import { TopNavBar } from '@/components/TopNavBar';
import { SectionHeader } from '@/components/SectionHeader';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlineButton } from '@/components/OutlineButton';
import { Card } from '@/components/Card';
import { SearchBar } from '@/components/SearchBar';
import { ScreenLayout } from '../ScreenLayout';

type FilterStatus = 'ALL' | CommitteeRequestStatus;

export const CommitteeRequestsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      Alert.alert('Success', 'Committee request approved successfully');
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
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
            Alert.alert('Success', 'Committee request rejected');
            setSelectedRequests(prev => prev.filter(id => id !== requestId));
          } catch (error) {
            Alert.alert('Error', 'Failed to reject request');
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
              Alert.alert('Success', `${selectedRequests.length} requests approved`);
              setSelectedRequests([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to approve some requests');
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
            Alert.alert('Success', `${selectedRequests.length} requests rejected`);
            setSelectedRequests([]);
          } catch (error) {
            Alert.alert('Error', 'Failed to reject some requests');
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

  const getStatusColor = (status: CommitteeRequestStatus) => {
    switch (status) {
      case 'PENDING': return theme.colors.warning;
      case 'APPROVED': return theme.colors.success;
      case 'REJECTED': return theme.colors.error;
      case 'EXPIRED': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <ScreenLayout>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <TopNavBar 
          title="Committee Requests"
          subtitle={selectedUniversity?.universityName}
        />

        {/* Stats Overview */}
        {requestStats && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <SectionHeader title="Overview" />
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
              <View style={{ flex: 1, minWidth: 100 }}>
                <Card style={{ alignItems: 'center', padding: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.warning }}>
                    {requestStats.pending}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Pending</Text>
                </Card>
              </View>
              <View style={{ flex: 1, minWidth: 100 }}>
                <Card style={{ alignItems: 'center', padding: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.success }}>
                    {requestStats.approved}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Approved</Text>
                </Card>
              </View>
              <View style={{ flex: 1, minWidth: 100 }}>
                <Card style={{ alignItems: 'center', padding: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.error }}>
                    {requestStats.rejected}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Rejected</Text>
                </Card>
              </View>
            </View>
          </View>
        )}

        {/* Search and Filters */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <SearchBar
            placeholder="Search by student or society name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginTop: 16 }}
          >
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'] as FilterStatus[]).map((filter) => (
              <Pressable key={filter} onPress={() => setSelectedFilter(filter)}>
                <BadgeChip 
                  label={filter === 'ALL' ? 'All' : filter.toLowerCase()} 
                  variant={selectedFilter === filter ? 'filled' : 'outlined'} 
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <View style={{ 
            paddingHorizontal: 20, 
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.surface,
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 16,
          }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>
              {selectedRequests.length} selected
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <OutlineButton label="Reject" onPress={handleBulkReject} />
              <PrimaryButton label="Approve" onPress={handleBulkApprove} />
            </View>
          </View>
        )}

        {/* Requests List */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader 
            title="Requests" 
            rightText={`${filteredRequests.length} of ${totalUniversityRequests}`}
          />
          
          {filteredRequests.length === 0 ? (
            <Card style={{ alignItems: 'center', padding: 40 }}>
              <MaterialIcons name="inbox" size={48} color={theme.colors.textSecondary} />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.colors.textPrimary, 
                marginTop: 12 
              }}>
                No requests found
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: theme.colors.textSecondary, 
                textAlign: 'center',
                marginTop: 4
              }}>
                {searchQuery ? 'Try adjusting your search terms' : 'All committee requests will appear here'}
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 12, marginTop: 12 }}>
              {filteredRequests.map((request) => (
                <Card key={request.id} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    {/* Selection Checkbox */}
                    <Pressable
                      onPress={() => toggleRequestSelection(request.id)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selectedRequests.includes(request.id) ? theme.colors.primary : theme.colors.border,
                        backgroundColor: selectedRequests.includes(request.id) ? theme.colors.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      {selectedRequests.includes(request.id) && (
                        <MaterialIcons name="check" size={14} color={theme.colors.background} />
                      )}
                    </Pressable>

                    {/* Request Details */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
                            {request.user?.fullName}
                          </Text>
                          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                            {request.society?.name} • {request.currentRole} → {request.requestedRole}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <BadgeChip 
                            label={request.status.toLowerCase()} 
                            variant="filled"
                            style={{ backgroundColor: getStatusColor(request.status) }}
                          />
                          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      {request.justification && (
                        <Text style={{ fontSize: 14, color: theme.colors.textPrimary, lineHeight: 20, marginBottom: 12 }}>
                          {request.justification}
                        </Text>
                      )}

                      {request.status === 'PENDING' && (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <OutlineButton 
                              label="Reject" 
                              onPress={() => handleReject(request.id)} 
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <PrimaryButton 
                              label="Approve" 
                              onPress={() => handleApprove(request.id)} 
                            />
                          </View>
                        </View>
                      )}

                      {request.reviewerComments && (
                        <View style={{ 
                          marginTop: 12, 
                          padding: 12, 
                          backgroundColor: theme.colors.background,
                          borderRadius: 8,
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 }}>
                            Admin Comment:
                          </Text>
                          <Text style={{ fontSize: 14, color: theme.colors.textPrimary }}>
                            {request.reviewerComments}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};