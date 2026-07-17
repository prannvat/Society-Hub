import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getUniversitySettings, updateUniversitySettings } from '@/services/api/union-admin';
import { UniversitySettings } from '@/types/union-admin';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { ScreenLayout } from '../ScreenLayout';

const JOIN_POLICIES: { label: string; value: UniversitySettings['defaultJoinPolicy'] }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Approval Required', value: 'APPROVAL_REQUIRED' },
  { label: 'Verified Students', value: 'VERIFIED_STUDENTS_ONLY' },
];

const BOOLEAN_FIELDS: { key: keyof Pick<
  UniversitySettings,
  'requireEmailVerification' | 'allowSelfSocietyCreation' | 'requireSocietyApproval' | 'requireCommitteeApproval'
>; label: string; description: string }[] = [
  {
    key: 'requireEmailVerification',
    label: 'Require Email Verification',
    description: 'Students must verify their university email before joining societies.',
  },
  {
    key: 'allowSelfSocietyCreation',
    label: 'Allow Society Creation',
    description: 'Students can create new societies themselves.',
  },
  {
    key: 'requireSocietyApproval',
    label: 'Require Society Approval',
    description: 'New societies need union approval before going live.',
  },
  {
    key: 'requireCommitteeApproval',
    label: 'Require Committee Approval',
    description: 'Committee role changes need union approval.',
  },
];

type NumericField = {
  key: keyof Pick<UniversitySettings, 'maxSocietiesPerStudent' | 'committeeRequestExpiryDays'>;
  label: string;
  description: string;
  min: number;
  max: number;
};

const NUMERIC_FIELDS: NumericField[] = [
  {
    key: 'maxSocietiesPerStudent',
    label: 'Max Societies per Student',
    description: 'How many societies a student can be a member of.',
    min: 1,
    max: 50,
  },
  {
    key: 'committeeRequestExpiryDays',
    label: 'Committee Request Expiry (days)',
    description: 'Pending committee requests expire after this many days.',
    min: 1,
    max: 365,
  },
];

export const UnionSettingsScreen = () => {
  const theme = useAppTheme();
  const { selectedUniversityId, unionAdminRelationships } = useUserRoles();

  const [savedSettings, setSavedSettings] = useState<UniversitySettings | null>(null);
  const [draft, setDraft] = useState<UniversitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const selectedUniversity = unionAdminRelationships.find(
    (entry) => entry.universityId === selectedUniversityId,
  );

  const loadSettings = useCallback(async () => {
    if (!selectedUniversityId) {
      return;
    }
    try {
      const settings = await getUniversitySettings(selectedUniversityId);
      setSavedSettings(settings);
      setDraft(settings);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to load university settings. Pull down to retry.');
    }
  }, [selectedUniversityId]);

  useEffect(() => {
    setIsLoading(true);
    setFeedback(null);
    loadSettings().finally(() => setIsLoading(false));
  }, [loadSettings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const isDirty =
    savedSettings !== null && draft !== null && JSON.stringify(savedSettings) !== JSON.stringify(draft);

  const updateDraft = <K extends keyof UniversitySettings>(key: K, value: UniversitySettings[K]) => {
    setFeedback(null);
    setDraft((prev: UniversitySettings | null) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!selectedUniversityId || !draft || !savedSettings || !isDirty || isSaving) {
      return;
    }

    // Only send the fields that changed.
    const changes: Partial<UniversitySettings> = {};
    (Object.keys(draft) as (keyof UniversitySettings)[]).forEach((key) => {
      if (draft[key] !== savedSettings[key]) {
        (changes as Record<string, unknown>)[key] = draft[key];
      }
    });

    setIsSaving(true);
    try {
      const updated = await updateUniversitySettings(selectedUniversityId, changes);
      setSavedSettings(updated);
      setDraft(updated);
      setFeedback({ kind: 'success', message: 'Settings saved.' });
    } catch {
      setFeedback({ kind: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepper = (field: NumericField) => {
    if (!draft) {
      return null;
    }
    const value = draft[field.key];
    return (
      <Card key={field.key}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary }}>{field.label}</Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 18 }}>
              {field.description}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => updateDraft(field.key, Math.max(field.min, value - 1))}
              disabled={value <= field.min}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: value <= field.min ? 0.4 : 1,
              }}
            >
              <MaterialIcons name="remove" size={18} color={theme.colors.textPrimary} />
            </Pressable>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.textPrimary,
                minWidth: 32,
                textAlign: 'center',
              }}
            >
              {value}
            </Text>
            <Pressable
              onPress={() => updateDraft(field.key, Math.min(field.max, value + 1))}
              disabled={value >= field.max}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: value >= field.max ? 0.4 : 1,
              }}
            >
              <MaterialIcons name="add" size={18} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <TopNavBar title="Settings" subtitle={selectedUniversity?.universityName} />

        {isLoading ? (
          <LoadingState />
        ) : errorMessage || !draft ? (
          <EmptyState
            title="Something went wrong"
            subtitle={errorMessage ?? 'University settings are unavailable right now.'}
          />
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 24 }}>
            {/* Boolean toggles */}
            <View>
              <SectionHeader title="Policies" />
              <View style={{ gap: 12, marginTop: 12 }}>
                {BOOLEAN_FIELDS.map((field) => (
                  <Card key={field.key}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary }}>
                          {field.label}
                        </Text>
                        <Text
                          style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 18 }}
                        >
                          {field.description}
                        </Text>
                      </View>
                      <Switch
                        value={draft[field.key]}
                        onValueChange={(next) => updateDraft(field.key, next)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            </View>

            {/* Numeric limits */}
            <View>
              <SectionHeader title="Limits" />
              <View style={{ gap: 12, marginTop: 12 }}>{NUMERIC_FIELDS.map(renderStepper)}</View>
            </View>

            {/* Default join policy */}
            <View>
              <SectionHeader title="Default Join Policy" />
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 18 }}>
                Applied to new societies unless they choose their own policy.
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {JOIN_POLICIES.map((policy) => (
                  <Pressable key={policy.value} onPress={() => updateDraft('defaultJoinPolicy', policy.value)}>
                    <BadgeChip
                      label={policy.label}
                      variant={draft.defaultJoinPolicy === policy.value ? 'filled' : 'outlined'}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {feedback ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: feedback.kind === 'success' ? theme.colors.success : theme.colors.error,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <Text
                  style={{
                    color: feedback.kind === 'success' ? theme.colors.success : theme.colors.error,
                    fontWeight: '600',
                  }}
                >
                  {feedback.message}
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              label={isSaving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={!isDirty || isSaving}
            />
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};
