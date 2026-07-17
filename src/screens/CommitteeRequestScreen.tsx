import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCommitteeRequests } from '@/hooks/useCommitteeRequests';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { MemberRole } from '@/types/union-admin';
import { TopNavBar } from '@/components/TopNavBar';
import { SectionHeader } from '@/components/SectionHeader';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlineButton } from '@/components/OutlineButton';
import { Card } from '@/components/Card';
import { InputField } from '@/components/InputField';
import { ScreenLayout } from './ScreenLayout';

type CommitteeRequestScreenRouteProp = RouteProp<RootStackParamList, 'CommitteeRequest'>;

type CommitteeRequestScreenParams = {
  societyId: string;
  currentRole: MemberRole;
};

export const CommitteeRequestScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CommitteeRequestScreenRouteProp>();
  const { submitRequest } = useCommitteeRequests();
  const { allSocieties, profile } = useLocalAppState();

  // Get params from route or use defaults
  const societyId = route.params?.societyId || '';
  const currentRole = route.params?.currentRole || 'Member';

  const [requestedRole, setRequestedRole] = useState<MemberRole>('Committee');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const society = allSocieties.find(s => s.id === societyId);

  const handleSubmit = async () => {
    if (!justification.trim()) {
      Alert.alert('Error', 'Please provide a justification for your request');
      return;
    }

    if (!society) {
      Alert.alert('Error', 'Society not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRequest({
        societyId,
        requestedRole,
        justification: justification.trim(),
      });

      Alert.alert(
        'Request Submitted',
        'Your committee role request has been submitted for union admin review. You will be notified when it is processed.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDescription = (role: MemberRole) => {
    switch (role) {
      case 'Committee':
        return 'Create events, polls, and announcements. Manage society content and activities.';
      case 'President':
        return 'Full society management including member roles, settings, and administrative oversight.';
      case 'Member':
        return 'Basic member access to participate in society events and activities.';
      default:
        return '';
    }
  };

  const getAvailableRoles = (): MemberRole[] => {
    if (currentRole === 'Member') {
      return ['Committee', 'President'];
    } else if (currentRole === 'Committee') {
      return ['President'];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  if (!society) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="error" size={48} color={theme.colors.error} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 12 }}>
            Society Not Found
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            The society you're trying to request a committee role for could not be found.
          </Text>
          <OutlineButton 
            label="Go Back" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </ScreenLayout>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="verified" size={48} color={theme.colors.success} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 12 }}>
            Maximum Role Reached
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            You already have the highest available role in {society.name}.
          </Text>
          <OutlineButton 
            label="Go Back" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <TopNavBar 
          title="Request Committee Role"
          subtitle={society.name}
          showBackButton={true}
          onPressBack={() => navigation.goBack()}
        />

        {/* Current Status */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Current Status" />
          <Card style={{ padding: 16, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialIcons name="person" size={24} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary }}>
                  {profile.fullName}
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                  Current Role: {currentRole}
                </Text>
              </View>
              <BadgeChip label={currentRole} variant="filled" />
            </View>
          </Card>
        </View>

        {/* Role Selection */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Requested Role" />
          <View style={{ gap: 12, marginTop: 12 }}>
            {availableRoles.map((role) => (
              <Pressable
                key={role}
                onPress={() => setRequestedRole(role)}
                style={[
                  {
                    borderWidth: 2,
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: requestedRole === role ? theme.colors.surface : 'transparent',
                  },
                  {
                    borderColor: requestedRole === role ? theme.colors.primary : theme.colors.border,
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: requestedRole === role ? theme.colors.primary : theme.colors.border,
                    backgroundColor: requestedRole === role ? theme.colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {requestedRole === role && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.colors.background,
                      }} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary }}>
                      {role}
                    </Text>
                    <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 18 }}>
                      {getRoleDescription(role)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Justification */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Justification" />
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, marginBottom: 12, lineHeight: 18 }}>
            Explain why you believe you should be granted this committee role. Include relevant experience, 
            contributions to the society, and plans for your role.
          </Text>
          
          <View style={{ 
            borderWidth: 1, 
            borderColor: theme.colors.border, 
            borderRadius: 12, 
            backgroundColor: theme.colors.surface,
            minHeight: 120,
          }}>
            <TextInput
              style={{
                padding: 16,
                fontSize: 16,
                color: theme.colors.textPrimary,
                textAlignVertical: 'top',
                minHeight: 120,
              }}
              multiline
              placeholder="Describe your qualifications, experience, and motivation for this role..."
              placeholderTextColor={theme.colors.textSecondary}
              value={justification}
              onChangeText={setJustification}
              maxLength={1000}
            />
          </View>
          
          <Text style={{ 
            fontSize: 12, 
            color: theme.colors.textSecondary, 
            textAlign: 'right', 
            marginTop: 8 
          }}>
            {justification.length}/1000 characters
          </Text>
        </View>

        {/* Important Notice */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Card style={{ 
            padding: 16, 
            backgroundColor: theme.colors.warning + '20', 
            borderColor: theme.colors.warning,
            borderWidth: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <MaterialIcons name="info" size={20} color={theme.colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 4 }}>
                  Union Admin Review Required
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.textPrimary, lineHeight: 18 }}>
                  Your request will be reviewed by university union administrators. This process may take 
                  several days. You'll receive a notification once your request has been processed.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Submit Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <PrimaryButton 
            label={isSubmitting ? "Submitting..." : "Submit Request"} 
            onPress={handleSubmit}
            disabled={isSubmitting || !justification.trim()}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};