import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { ListRow } from '@/components/ListRow';
import { MemberCard } from '@/components/MemberCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
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
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPushedRoute = useRoute().name === 'MembersDirectory';
  const { activeSocietyId, activeSocietyMembers, activeSocietyRole, refreshActiveSociety } = useLocalAppState();
  const [query, setQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [membershipRequests, setMembershipRequests] = React.useState<MembershipRequest[]>([]);
  const [actingRequestId, setActingRequestId] = React.useState<string | null>(null);
  const [requestsFailed, setRequestsFailed] = React.useState(false);

  const canReviewRequests = activeSocietyRole === 'President' || activeSocietyRole === 'Committee';

  const loadRequests = useCallback(async () => {
    if (!canReviewRequests || !activeSocietyId) {
      setMembershipRequests([]);
      return;
    }
    try {
      const requests = await fetchMembershipRequests(activeSocietyId);
      setMembershipRequests(requests.filter((request) => request.status === 'PENDING'));
      setRequestsFailed(false);
    } catch {
      // Don't silently show an empty list: "no pending requests" and "we
      // couldn't load them" look identical to a president, who then leaves
      // real people waiting for approval indefinitely.
      setRequestsFailed(true);
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
      toast.show(
        decision === 'approve'
          ? `${request.user.fullName} approved`
          : `Request from ${request.user.fullName} rejected`,
        'success'
      );
    } catch {
      toast.show(`Failed to ${decision} this request. Please try again.`, 'error');
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
    <ScreenLayout scroll={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TopNavBar
          gutter={false}
          title="Members"
          subtitle={`${activeSocietyRole} access`}
          actionLabel={viewMode === 'grid' ? 'List view' : 'Grid view'}
          onPressAction={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
          // Mounted twice under different route names: as the Admin 'Members'
          // tab (tab bar is the way out) and as the pushed 'MembersDirectory'
          // stack screen, which has no tab bar and no header — the back arrow is
          // its only exit.
          onBack={isPushedRoute ? () => navigation.goBack() : undefined}
        />

        {canReviewRequests && requestsFailed ? (
          <View style={styles.section}>
            <Card style={{ borderColor: theme.colors.warning }}>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                Couldn't load membership requests
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                There may be people waiting for approval.
              </Text>
              <View style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                <PrimaryButton label="Retry" size="sm" variant="ghost" onPress={loadRequests} />
              </View>
            </Card>
          </View>
        ) : null}

        {/* Membership requests — most urgent, so they lead the screen */}
        {canReviewRequests && membershipRequests.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Membership requests" rightText={`${membershipRequests.length} pending`} />
            {membershipRequests.map((request) => {
              const isActing = actingRequestId === request.id;
              return (
                <Card key={request.id} style={{ borderColor: theme.colors.warning }}>
                  <View style={styles.requestBody}>
                    <View style={styles.requestPerson}>
                      <Avatar name={request.user.fullName} size={44} url={request.user.avatarUrl ?? undefined} />
                      <View style={styles.requestText}>
                        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                          {request.user.fullName}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {request.user.email} • {new Date(request.requestedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      <PrimaryButton
                        label="Reject"
                        variant="ghost"
                        size="sm"
                        disabled={isActing}
                        onPress={() => handleRequestDecision(request, 'reject')}
                      />
                      <PrimaryButton
                        label="Approve"
                        size="sm"
                        loading={isActing}
                        onPress={() => handleRequestDecision(request, 'approve')}
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : null}

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search members..." />
        <FilterChips items={['All', 'Committee', 'New Members', 'My Year']} onChange={setActiveFilter} />
        <View style={styles.countRow}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} found
          </Text>
          {query.length > 0 ? (
            <Text
              style={[theme.typography.captionMedium, { color: theme.colors.primary }]}
              onPress={() => setQuery('')}
              suppressHighlighting
            >
              Clear
            </Text>
          ) : null}
        </View>

        {filteredMembers.length === 0 ? (
          <EmptyState
            icon="group-off"
            title="No members match"
            subtitle="Try a different filter or clear your search to see everyone in this society."
            actionLabel={query.length > 0 ? 'Clear search' : undefined}
            onAction={query.length > 0 ? () => setQuery('') : undefined}
          />
        ) : viewMode === 'grid' ? (
          <View style={styles.section}>
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onPressProfile={(selectedMember) => navigation.navigate('MemberProfile', { memberId: selectedMember.id })}
              />
            ))}
          </View>
        ) : (
          <Card padding={0} style={styles.listCard}>
            {filteredMembers.map((member) => (
              <ListRow
                key={member.id}
                title={member.name}
                subtitle={member.year}
                leading={<Avatar name={member.name} size={40} online={member.online} />}
                trailing={
                  <BadgeChip label={member.role} variant={member.role === 'Member' ? 'neutral' : 'primary'} />
                }
                chevron
                onPress={() => navigation.navigate('MemberProfile', { memberId: member.id })}
              />
            ))}
          </Card>
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
    paddingTop: 12,
    paddingBottom: 96,
    gap: 16
  },
  section: {
    gap: 12
  },
  requestBody: {
    gap: 14
  },
  requestPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  requestText: {
    flex: 1,
    gap: 2
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listCard: {
    overflow: 'hidden'
  }
});
