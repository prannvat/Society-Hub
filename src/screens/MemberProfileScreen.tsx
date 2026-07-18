import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { BadgeChip, BadgeChipVariant } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useCommitteeRequests } from '@/hooks/useCommitteeRequests';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MaterialIcons } from '@expo/vector-icons';
import { MemberRole } from '@/types';

const roleChipVariant: Record<MemberRole, BadgeChipVariant> = {
  President: 'primary',
  Committee: 'warning',
  Member: 'neutral'
};

export const MemberProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MemberProfile'>>();
  const toast = useToast();
  const { activeSocietyMembers, activeSocietyRole, activeSocietyId, assignMemberRole, profile, currentUserId, allSocieties } = useLocalAppState();
  const { myRequests } = useCommitteeRequests();
  const member = activeSocietyMembers.find((entry) => entry.id === route.params?.memberId) ?? activeSocietyMembers[0];

  if (!member) {
    return (
      <ScreenLayout scroll={false}>
        <TopNavBar title="Manage member" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrap}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Member not found</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            This member may have left the society, or the member list has not loaded yet.
          </Text>
          <OutlineButton label="Back" onPress={() => navigation.goBack()} />
        </View>
      </ScreenLayout>
    );
  }

  const canManageRoles = activeSocietyRole === 'President' && member.role !== 'President';

  // Check if this is the current user's profile
  const isOwnProfile = member.id === currentUserId || member.name === profile.fullName;

  // Check if there's already a pending request for this society
  const existingRequest = myRequests.find(req =>
    req.societyId === activeSocietyId &&
    req.status === 'PENDING'
  );

  // Determine available promotions for this user
  const canRequestCommitteeRole = isOwnProfile && member.role === 'Member' && !existingRequest;
  const canRequestPresidentRole = isOwnProfile && member.role === 'Committee' && !existingRequest;

  const isVerified = member.universityBadge === 'Verified';

  // IG-style @handle derived from the member's name — display convenience only.
  const handle = `@${member.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
  const activeSociety = allSocieties.find((society) => society.id === activeSocietyId);

  const requestRoleChange = (nextRole: 'Member' | 'Committee') => {
    if (member.role === nextRole) {
      toast.show(`${member.name} is already ${nextRole}`, 'info');
      return;
    }

    Alert.alert(
      'Confirm Role Update',
      `Set ${member.name} as ${nextRole} for this society?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await assignMemberRole(member.id, nextRole);
              toast.show(`${member.name} is now ${nextRole}`, 'success');
            } catch {
              toast.show('Unable to update role right now. Please try again.', 'error');
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title="Manage member" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Identity block — IG-style */}
        <View style={styles.identity}>
          <Avatar name={member.name} size={92} online={member.online} />
          <View style={styles.nameRow}>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, textAlign: 'center' }]} numberOfLines={1}>
              {member.name}
            </Text>
            {isVerified ? <MaterialIcons name="verified" size={20} color={theme.colors.primary} /> : null}
          </View>
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>{handle}</Text>
          {[member.year, member.universityBadge].filter(Boolean).length > 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {[member.year, member.universityBadge].filter(Boolean).join(' • ')}
            </Text>
          ) : null}
          <BadgeChip label={member.role} variant={roleChipVariant[member.role]} />
        </View>

        {/* Their societies — the society this profile is viewed within */}
        {activeSociety ? (
          <View style={styles.societyChips}>
            <Pressable
              onPress={() => navigation.navigate('SocietyProfile', { societyId: activeSociety.id })}
              style={({ pressed }) => [
                styles.societyChip,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.surfaceSunken,
                  opacity: pressed ? 0.7 : 1
                }
              ]}
            >
              <Avatar name={activeSociety.name} size={22} url={activeSociety.logoUrl ?? undefined} />
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {activeSociety.shortName || activeSociety.name}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="View Polls" size="md" variant="secondary" icon="poll" onPress={() => navigation.navigate('SocietyPolls', undefined)} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Open Society" size="md" variant="secondary" icon="groups" onPress={() => navigation.navigate('SocietyProfile', { societyId: activeSocietyId })} />
          </View>
        </View>

        {/* This screen is the committee's role-management surface; the real bio,
            links and societies live on the public profile. */}
        <PrimaryButton
          label="View full profile"
          size="md"
          variant="secondary"
          icon="person"
          onPress={() => navigation.navigate('UserProfile', { userId: member.id })}
        />

        {canManageRoles ? (
          <Card>
            <View style={{ gap: 12 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Role management</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Presidents can switch this member between Member and Committee for the active society.
              </Text>
              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Make Committee" size="md" onPress={() => requestRoleChange('Committee')} />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Set Member" size="md" variant="secondary" onPress={() => requestRoleChange('Member')} />
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        {/* Committee Request Section - Only shown for own profile */}
        {isOwnProfile && (canRequestCommitteeRole || canRequestPresidentRole) && (
          <Card>
            <View style={{ gap: 12 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Request Role Promotion</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Apply for a higher committee role in this society. All requests require union admin approval.
              </Text>

              {canRequestCommitteeRole && (
                <View style={{ gap: 8 }}>
                  <PrimaryButton
                    label="Request Committee Role"
                    icon="trending-up"
                    onPress={() => navigation.navigate('CommitteeRequest', {
                      societyId: activeSocietyId,
                      currentRole: member.role,
                    })}
                  />
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    Committee members can create events, posts, and polls
                  </Text>
                </View>
              )}

              {canRequestPresidentRole && (
                <View style={{ gap: 8 }}>
                  <PrimaryButton
                    label="Request President Role"
                    icon="trending-up"
                    onPress={() => navigation.navigate('CommitteeRequest', {
                      societyId: activeSocietyId,
                      currentRole: member.role,
                    })}
                  />
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    Presidents have full society management access
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Pending Request Status - Only shown for own profile */}
        {isOwnProfile && existingRequest && (
          <Card style={{ backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning }}>
            <View style={{ gap: 8 }}>
              <View style={styles.pendingHeader}>
                <MaterialIcons name="pending" size={20} color={theme.colors.warning} />
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                  Committee Request Pending
                </Text>
              </View>
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                Your request for {existingRequest.requestedRole} role is being reviewed by union administrators.
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Submitted {new Date(existingRequest.requestedAt).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16
  },
  identity: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  societyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'
  },
  societyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  }
});
