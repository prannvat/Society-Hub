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
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const MemberProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MemberProfile'>>();
  const { activeSocietyMembers, activeSocietyRole, activeSocietyId, assignMemberRole } = useLocalAppState();
  const member = activeSocietyMembers.find((entry) => entry.id === route.params?.memberId) ?? activeSocietyMembers[0];
  const canManageRoles = activeSocietyRole === 'President' && member.role !== 'President';

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
          onPress: () => {
            assignMemberRole(member.id, nextRole);
            Alert.alert('Role Updated', `${member.name} is now ${nextRole}.`);
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
      </View>
    </ScreenLayout>
  );
};
