import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getUniversitySettings, updateUniversitySettings } from '@/services/api/union-admin';
import { UniversitySettings } from '@/types/union-admin';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';
import { LoadingState } from '@/components/LoadingState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from '../ScreenLayout';

const JOIN_POLICIES: { label: string; value: UniversitySettings['defaultJoinPolicy'] }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Approval Required', value: 'APPROVAL_REQUIRED' },
  { label: 'Verified Students', value: 'VERIFIED_STUDENTS_ONLY' },
];

type BooleanFieldKey = keyof Pick<
  UniversitySettings,
  'requireEmailVerification' | 'allowSelfSocietyCreation' | 'requireSocietyApproval' | 'requireCommitteeApproval'
>;

type BooleanField = { key: BooleanFieldKey; label: string; description: string };

// Grouped so the screen reads as: how people join, then what the union reviews.
const MEMBERSHIP_FIELDS: BooleanField[] = [
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
];

const APPROVAL_FIELDS: BooleanField[] = [
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
  const toast = useToast();
  const { selectedUniversityId, unionAdminRelationships } = useUserRoles();

  const [savedSettings, setSavedSettings] = useState<UniversitySettings | null>(null);
  const [draft, setDraft] = useState<UniversitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      toast.show('Settings saved', 'success');
    } catch {
      toast.show('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderToggleGroup = (title: string, fields: BooleanField[]) => {
    if (!draft) {
      return null;
    }
    return (
      <View style={styles.section}>
        <SectionHeader title={title} />
        <Card padding={0} style={styles.groupCard}>
          {fields.map((field, index) => (
            <View
              key={field.key}
              style={
                index < fields.length - 1
                  ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }
                  : undefined
              }
            >
              <ListRow
                title={field.label}
                subtitle={field.description}
                trailing={
                  <Switch
                    value={draft[field.key]}
                    onValueChange={(next) => updateDraft(field.key, next)}
                    trackColor={{ false: theme.colors.surfaceSunken, true: theme.colors.primary }}
                    ios_backgroundColor={theme.colors.surfaceSunken}
                  />
                }
              />
            </View>
          ))}
        </Card>
      </View>
    );
  };

  const renderStepper = (field: NumericField) => {
    if (!draft) {
      return null;
    }
    const value = draft[field.key];
    const atMin = value <= field.min;
    const atMax = value >= field.max;

    const stepperButton = (iconName: 'remove' | 'add', disabled: boolean, onPress: () => void) => (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${iconName === 'add' ? 'Increase' : 'Decrease'} ${field.label}`}
        style={({ pressed }) => [
          styles.stepperButton,
          {
            borderColor: pressed && !disabled ? theme.colors.primary : theme.colors.borderStrong,
            backgroundColor: pressed && !disabled ? theme.colors.primarySoft : theme.colors.surface,
            opacity: disabled ? 0.4 : 1,
            transform: [{ scale: pressed && !disabled ? 0.95 : 1 }]
          }
        ]}
      >
        <MaterialIcons name={iconName} size={18} color={theme.colors.primary} />
      </Pressable>
    );

    return (
      <Card key={field.key}>
        <View style={styles.stepperRow}>
          <View style={styles.stepperText}>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{field.label}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{field.description}</Text>
          </View>
          <View style={styles.stepperControls}>
            {stepperButton('remove', atMin, () => updateDraft(field.key, Math.max(field.min, value - 1)))}
            <Text style={[theme.typography.h3, styles.stepperValue, { color: theme.colors.textPrimary }]}>{value}</Text>
            {stepperButton('add', atMax, () => updateDraft(field.key, Math.min(field.max, value + 1)))}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.textTertiary} />
          }
        >
          <TopNavBar gutter={false} title="Settings" subtitle={selectedUniversity?.universityName} />

          <Text style={[theme.typography.caption, styles.intro, { color: theme.colors.textSecondary }]}>
            Set university-wide rules for how students join and create societies.
          </Text>

          {isLoading ? (
            <LoadingState />
          ) : errorMessage || !draft ? (
            <EmptyState
              icon="cloud-off"
              title="Something went wrong"
              subtitle={errorMessage ?? 'University settings are unavailable right now.'}
            />
          ) : (
            <View style={styles.sections}>
              {renderToggleGroup('Membership policies', MEMBERSHIP_FIELDS)}
              {renderToggleGroup('Approvals', APPROVAL_FIELDS)}

              {/* Numeric limits */}
              <View style={styles.section}>
                <SectionHeader title="Limits" />
                <View style={styles.limitList}>{NUMERIC_FIELDS.map(renderStepper)}</View>
              </View>

              {/* Default join policy */}
              <View style={styles.section}>
                <SectionHeader title="Default join policy" />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Applied to new societies unless they choose their own policy.
                </Text>
                <View style={styles.policyRow}>
                  {JOIN_POLICIES.map((policy) => {
                    const selected = draft.defaultJoinPolicy === policy.value;
                    return (
                      <Pressable
                        key={policy.value}
                        onPress={() => updateDraft('defaultJoinPolicy', policy.value)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
                        style={({ pressed }) => [
                          styles.policyChip,
                          {
                            borderRadius: theme.radius.pill,
                            backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                            borderColor: selected ? theme.colors.primary : theme.colors.border,
                            opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1,
                            transform: [{ scale: pressed ? 0.97 : 1 }]
                          }
                        ]}
                      >
                        <Text
                          style={[
                            theme.typography.captionMedium,
                            { color: selected ? theme.colors.textOnPrimary : theme.colors.textSecondary, fontSize: 14 }
                          ]}
                          numberOfLines={1}
                        >
                          {policy.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sticky save bar — only actionable when the draft differs from saved settings */}
        {!isLoading && draft ? (
          <View
            style={[
              styles.saveBar,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border
              }
            ]}
          >
            <PrimaryButton
              label={isDirty ? 'Save Changes' : 'All changes saved'}
              onPress={handleSave}
              loading={isSaving}
              disabled={!isDirty}
            />
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24
  },
  intro: {
    marginTop: 12
  },
  sections: {
    marginTop: 16,
    gap: 24
  },
  section: {
    gap: 12
  },
  groupCard: {
    overflow: 'hidden'
  },
  limitList: {
    gap: 12
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepperText: {
    flex: 1,
    gap: 2
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperValue: {
    minWidth: 36,
    textAlign: 'center'
  },
  policyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  policyChip: {
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16
  }
});
