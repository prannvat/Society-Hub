import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useCommitteeRequests } from '@/hooks/useCommitteeRequests';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MaterialIcons } from '@expo/vector-icons';

export const MemberProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MemberProfile'>>();
  const { activeSocietyMembers, activeSocietyRole, activeSocietyId, assignMemberRole, profile, currentUserId } = useLocalAppState();
  const { myRequests } = useCommitteeRequests();
  const member = activeSocietyMembers.find((entry) => entry.id === route.params?.memberId) ?? activeSocietyMembers[0];
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

  const requestRoleChange = (nextRole: 'Member' | 'Committee') => {
    if (member.role === nextRole) {
      Alert.alert('No Change Needed', `${member.name} is already ${nextRole}.`);
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
              Alert.alert('Role Updated', `${member.name} is now ${nextRole}.`);
            } catch {
              Alert.alert('Update Failed', 'Unable to update role right now. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Avatar name={member.name} size={84} online={member.online} />
        <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800' }}>{member.name}</Text>
        <BadgeChip label={member.role} />
        <Text style={{ color: theme.colors.textSecondary }}>{member.year} • {member.universityBadge}</Text>
      </View>
      <Text style={{ color: theme.colors.textSecondary }}>
        Passionate about community events, volunteering, and student wellbeing.
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton label="View Polls" onPress={() => navigation.navigate('MainTabs', { screen: 'Polls' })} />
        </View>
        <View style={{ flex: 1 }}>
          <OutlineButton label="Open Society" onPress={() => navigation.navigate('SocietyProfile', { societyId: activeSocietyId })} />
        </View>
      </View>

      <Card>
        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.colors.textSecondary }}>About</Text>
          <Text style={{ color: theme.colors.textPrimary }}>Interested in helping new members settle in and grow confidence.</Text>
        </View>
      </Card>

      {canManageRoles ? (
        <Card>
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>Role management</Text>
            <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
              Presidents can switch this member between Member and Committee for the active society.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton label="Make Committee" onPress={() => requestRoleChange('Committee')} />
              </View>
              <View style={{ flex: 1 }}>
                <OutlineButton label="Set Member" onPress={() => requestRoleChange('Member')} />
              </View>
            </View>
          </View>
        </Card>
      ) : null}

      {/* Committee Request Section - Only shown for own profile */}
      {isOwnProfile && (canRequestCommitteeRole || canRequestPresidentRole) && (
        <Card>
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>Request Role Promotion</Text>
            <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
              Apply for a higher committee role in this society. All requests require union admin approval.
            </Text>
            
            {canRequestCommitteeRole && (
              <View style={{ gap: 8 }}>
                <PrimaryButton 
                  label="Request Committee Role" 
                  onPress={() => navigation.navigate('CommitteeRequest', {
                    societyId: activeSocietyId,
                    currentRole: member.role,
                  })}
                />
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                  Committee members can create events, posts, and polls
                </Text>
              </View>
            )}
            
            {canRequestPresidentRole && (
              <View style={{ gap: 8 }}>
                <PrimaryButton 
                  label="Request President Role" 
                  onPress={() => navigation.navigate('CommitteeRequest', {
                    societyId: activeSocietyId,
                    currentRole: member.role,
                  })}
                />
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                  Presidents have full society management access
                </Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Pending Request Status - Only shown for own profile */}
      {isOwnProfile && existingRequest && (
        <Card style={{ backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning, borderWidth: 1 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="pending" size={20} color={theme.colors.warning} />
              <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
                Committee Request Pending
              </Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary, lineHeight: 18 }}>
              Your request for {existingRequest.requestedRole} role is being reviewed by union administrators.
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              Submitted {new Date(existingRequest.requestedAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      )}
      </View>
    </ScreenLayout>
  );
};
