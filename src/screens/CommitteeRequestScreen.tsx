import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCommitteeRequests } from '@/hooks/useCommitteeRequests';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { MemberRole } from '@/types';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';

type CommitteeRequestScreenRouteProp = RouteProp<RootStackParamList, 'CommitteeRequest'>;

export const CommitteeRequestScreen = () => {
  const theme = useAppTheme();
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CommitteeRequestScreenRouteProp>();
  const { submitRequest } = useCommitteeRequests();
  const { allSocieties, profile } = useLocalAppState();

  // Get params from route or use defaults
  const societyId = route.params?.societyId || '';
  const currentRole = (route.params?.currentRole || 'Member') as MemberRole;

  const [requestedRole, setRequestedRole] = useState<MemberRole>('Committee');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const society = allSocieties.find(s => s.id === societyId);

  const handleSubmit = async () => {
    if (!justification.trim()) {
      toast.show('Please provide a justification for your request', 'error');
      return;
    }

    if (!society) {
      toast.show('Society not found', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRequest({
        societyId,
        requestedRole,
        justification: justification.trim(),
      });

      toast.show('Request submitted for union admin review', 'success');
      navigation.goBack();
    } catch (error) {
      toast.show('Failed to submit request. Please try again.', 'error');
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
      <ScreenLayout scroll={false}>
        <View style={styles.centerWrap}>
          <EmptyState
            icon="error-outline"
            title="Society not found"
            subtitle="The society you're trying to request a committee role for could not be found."
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </View>
      </ScreenLayout>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <ScreenLayout scroll={false}>
        <View style={styles.centerWrap}>
          <EmptyState
            icon="verified"
            title="Maximum role reached"
            subtitle={`You already have the highest available role in ${society.name}.`}
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <TopNavBar title="Request Committee Role" subtitle={society.name} onBack={() => navigation.goBack()} />
      <View style={styles.page}>
        {/* Current status */}
        <View style={styles.section}>
          <SectionHeader title="Current status" />
          <Card>
            <View style={styles.statusRow}>
              <Avatar name={profile.fullName} size={44} />
              <View style={styles.statusText}>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {profile.fullName}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Current role in {society.shortName ?? society.name}
                </Text>
              </View>
              <BadgeChip label={currentRole} variant={currentRole === 'Member' ? 'neutral' : 'primary'} />
            </View>
          </Card>
        </View>

        {/* Role selection */}
        <View style={styles.section}>
          <SectionHeader title="Requested role" />
          <View style={styles.roleList}>
            {availableRoles.map((role) => {
              const selected = requestedRole === role;
              return (
                <Pressable
                  key={role}
                  onPress={() => setRequestedRole(role)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.roleCard,
                    {
                      borderRadius: theme.radius.card,
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: selected
                        ? theme.colors.primarySoft
                        : pressed
                          ? theme.colors.surfaceSunken
                          : theme.colors.surface,
                      transform: [{ scale: pressed ? 0.99 : 1 }]
                    }
                  ]}
                >
                  <MaterialIcons
                    name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={22}
                    color={selected ? theme.colors.primary : theme.colors.textTertiary}
                  />
                  <View style={styles.roleText}>
                    <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{role}</Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                      {getRoleDescription(role)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Justification */}
        <View style={styles.section}>
          <SectionHeader title="Justification" />
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Explain why you believe you should be granted this committee role. Include relevant experience,
            contributions to the society, and plans for your role.
          </Text>
          <InputField
            placeholder="Describe your qualifications, experience, and motivation for this role..."
            value={justification}
            onChangeText={(value) => {
              if (value.length <= 1000) {
                setJustification(value);
              }
            }}
            multiline
          />
          <Text style={[theme.typography.caption, styles.charCount, { color: theme.colors.textTertiary }]}>
            {justification.length}/1000 characters
          </Text>
        </View>

        {/* Review notice */}
        <View
          style={[
            styles.noticeCard,
            { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning, borderRadius: theme.radius.card }
          ]}
        >
          <MaterialIcons name="info-outline" size={20} color={theme.colors.warning} />
          <View style={styles.noticeText}>
            <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}>
              Union admin review required
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Your request will be reviewed by university union administrators. This process may take several days.
              You'll receive a notification once your request has been processed.
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Submit Request"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!justification.trim()}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    justifyContent: 'center'
  },
  page: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 24
  },
  section: {
    gap: 12
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  statusText: {
    flex: 1,
    gap: 2
  },
  roleList: {
    gap: 12
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1.5,
    padding: 16,
    minHeight: 64
  },
  roleText: {
    flex: 1,
    gap: 2
  },
  charCount: {
    textAlign: 'right',
    marginTop: -4
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    padding: 14
  },
  noticeText: {
    flex: 1,
    gap: 4
  }
});
