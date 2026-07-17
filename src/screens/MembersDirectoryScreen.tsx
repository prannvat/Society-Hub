import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { FilterChips } from '@/components/FilterChips';
import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { MemberCard } from '@/components/MemberCard';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import {
  approveMembershipRequest,
  fetchMembershipRequests,
  MembershipRequest,
  rejectMembershipRequest,
} from '@/services/api/memberships';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const MembersDirectoryScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSocietyId, activeSocietyMembers, activeSocietyRole, refreshActiveSociety } = useLocalAppState();
  const [query, setQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [membershipRequests, setMembershipRequests] = React.useState<MembershipRequest[]>([]);
  const [actingRequestId, setActingRequestId] = React.useState<string | null>(null);

  const canReviewRequests = activeSocietyRole === 'President' || activeSocietyRole === 'Committee';

  const loadRequests = useCallback(async () => {
    if (!canReviewRequests || !activeSocietyId) {
      setMembershipRequests([]);
      return;
    }
    try {
      const requests = await fetchMembershipRequests(activeSocietyId);
      setMembershipRequests(requests.filter((request) => request.status === 'PENDING'));
    } catch {
      setMembershipRequests([]);
    }
  }, [canReviewRequests, activeSocietyId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRequestDecision = async (request: MembershipRequest, decision: 'approve' | 'reject') => {
    setActingRequestId(request.id);
    try {
      if (decision === 'approve') {
        await approveMembershipRequest(request.id);
        await refreshActiveSociety();
      } else {
        await rejectMembershipRequest(request.id);
      }
      setMembershipRequests((prev) => prev.filter((entry) => entry.id !== request.id));
    } catch {
      Alert.alert('Error', `Failed to ${decision} this request. Please try again.`);
    } finally {
      setActingRequestId(null);
    }
  };

  const filteredMembers = activeSocietyMembers
    .filter((member) => member.name.toLowerCase().includes(query.toLowerCase()))
    .filter((member) => {
      if (activeFilter === 'All') {
        return true;
      }

      if (activeFilter === 'Committee') {
        return member.role !== 'Member';
      }

      if (activeFilter === 'New Members') {
        return member.year.includes('1st');
      }

      if (activeFilter === 'My Year') {
        return member.year.includes('2nd');
      }

      return true;
    });

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 96, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
      <TopNavBar
        title="Members"
        actionLabel={viewMode === 'grid' ? 'List View' : 'Grid View'}
        onPressAction={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
      />

      {/* Membership Requests — visible to committee and presidents */}
      {canReviewRequests && membershipRequests.length > 0 ? (
        <View style={{ gap: 12 }}>
          <SectionHeader title="Membership Requests" rightText={`${membershipRequests.length} pending`} />
          {membershipRequests.map((request) => {
            const isActing = actingRequestId === request.id;
            return (
              <Card key={request.id}>
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={request.user.fullName} size={40} url={request.user.avatarUrl ?? undefined} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>
                        {request.user.fullName}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                        {request.user.email} • {new Date(request.requestedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <OutlineButton
                        label="Reject"
                        onPress={() => handleRequestDecision(request, 'reject')}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <PrimaryButton
                        label={isActing ? 'Working...' : 'Approve'}
                        onPress={() => handleRequestDecision(request, 'approve')}
                        disabled={isActing}
                      />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}

      <Card>
        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>Access and people</Text>
          <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
            Current access: {activeSocietyRole}. Presidents can change member roles from each profile.
          </Text>
        </View>
      </Card>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search members..." />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.textSecondary }}>{filteredMembers.length} members found</Text>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => setQuery('')}>Clear</Text>
      </View>
      <FilterChips items={['All', 'Committee', 'New Members', 'My Year']} onChange={setActiveFilter} />
      {filteredMembers.length === 0 ? (
        <Card>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' }}>No members match this filter</Text>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
              Try a different filter or clear your search to see everyone in this society.
            </Text>
          </View>
        </Card>
      ) : viewMode === 'grid' ? (
        <View style={{ gap: 12 }}>
          {filteredMembers.slice(0, 12).map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onPressProfile={(selectedMember) => navigation.navigate('MemberProfile', { memberId: selectedMember.id })}
            />
          ))}
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, overflow: 'hidden' }}>
          {filteredMembers.map((member) => (
            <ListItem
              key={member.id}
              label={member.name}
              right={<Text style={{ color: theme.colors.textSecondary }}>{member.role}</Text>}
              onPress={() => navigation.navigate('MemberProfile', { memberId: member.id })}
            />
          ))}
        </View>
      )}
      </ScrollView>
    </ScreenLayout>
  );
};
