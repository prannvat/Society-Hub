import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { profileErrorMessage } from '@/services/api/users';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

/** Two-step onboarding progress affordance (profile → interests). */
const StepIndicator = ({ current }: { current: 1 | 2 }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.stepIndicator}>
      <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
        Step {current} of 2
      </Text>
      <View style={styles.stepTrack}>
        {[1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.stepSegment,
              {
                borderRadius: theme.radius.pill,
                backgroundColor: step <= current ? theme.colors.primary : theme.colors.border
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export const ProfileSetupScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();
  const { profile, updateProfile } = useLocalAppState();

  const [location, setLocation] = useState(profile.location || '');
  const [isStudent, setIsStudent] = useState(profile.isStudent ?? true);
  const [university, setUniversity] = useState(profile.university || '');
  const [course, setCourse] = useState(profile.course || '');
  const [year, setYear] = useState(profile.year || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        ...profile,
        location: location.trim() || profile.location,
        isStudent,
        university: isStudent ? (university.trim() || profile.university) : '',
        course: isStudent ? (course.trim() || profile.course) : '',
        year: isStudent ? (year.trim() || profile.year) : '',
        bio: bio.trim() || profile.bio
      });
      navigation.navigate('InterestSelection');
    } catch (e) {
      // This is the first flow a new user sees — a silent failure looks like a
      // dead button and there is no other way out of the step.
      console.error('Failed to update profile', e);
      toast.show(profileErrorMessage(e), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
        <StepIndicator current={1} />

        <View style={{ marginTop: theme.spacing.md }}>
          <ScreenHeader
            title="Set Up Your Profile"
            subtitle="Complete your basics so you can discover relevant societies and events."
          />
        </View>

        <View style={{ gap: theme.spacing.xl, marginTop: theme.spacing.xl }}>
          <InputField
            label="Where are you based?"
            placeholder="e.g. London"
            icon="place"
            autoCapitalize="words"
            value={location}
            onChangeText={setLocation}
          />

          <View style={[styles.switchRow, { borderColor: theme.colors.border }]}>
            <View style={styles.switchText}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                Are you a university student?
              </Text>
              <Text style={[theme.typography.caption, styles.switchCaption, { color: theme.colors.textSecondary }]}>
                Unlock campus-specific groups and societies. Committee roles require union approval.
              </Text>
            </View>
            <Switch
              value={isStudent}
              onValueChange={setIsStudent}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          {isStudent && (
            <View style={[styles.studentSection, { borderLeftColor: theme.colors.border, gap: theme.spacing.lg }]}>
              <View>
                <InputField
                  label="University *"
                  placeholder="e.g. King's College London"
                  icon="school"
                  autoCapitalize="words"
                  value={university}
                  onChangeText={setUniversity}
                />
                <Text style={[theme.typography.caption, styles.helperText, { color: theme.colors.textTertiary }]}>
                  Self-declare your university to access relevant societies. Committee roles require union admin
                  verification.
                </Text>
              </View>
              <InputField
                label="Course"
                placeholder="e.g. Computer Science"
                icon="menu-book"
                autoCapitalize="words"
                value={course}
                onChangeText={setCourse}
              />
              <InputField
                label="Year"
                placeholder="e.g. 2nd Year"
                icon="timeline"
                value={year}
                onChangeText={setYear}
              />
            </View>
          )}

          <InputField
            label="Bio (Optional)"
            placeholder="Tell us a little about yourself"
            multiline
            value={bio}
            onChangeText={setBio}
          />
        </View>

        <View style={[styles.footer, { paddingTop: theme.spacing.xl }]}>
          <PrimaryButton label="Continue" size="lg" onPress={handleContinue} loading={isSaving} />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 32
  },
  stepIndicator: {
    gap: 8
  },
  stepTrack: {
    flexDirection: 'row',
    gap: 6
  },
  stepSegment: {
    flex: 1,
    height: 4
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  switchText: {
    flex: 1
  },
  switchCaption: {
    marginTop: 2
  },
  studentSection: {
    paddingLeft: 12,
    borderLeftWidth: 2
  },
  helperText: {
    marginTop: 6
  },
  footer: {
    marginTop: 'auto'
  }
});
