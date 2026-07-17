import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useLocalAppState } from '@/hooks/useLocalAppState';
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

/** Selectable interest chip: primary fill when selected, quiet surface otherwise. */
const InterestChip = ({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderRadius: theme.radius.pill,
          backgroundColor: selected
            ? pressed
              ? theme.colors.primaryPressed
              : theme.colors.primary
            : pressed
              ? theme.colors.surfaceSunken
              : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border
        }
      ]}
    >
      {selected ? <MaterialIcons name="check" size={16} color={theme.colors.textOnPrimary} /> : null}
      <Text
        style={[
          theme.typography.bodyMedium,
          { color: selected ? theme.colors.textOnPrimary : theme.colors.textPrimary }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const InterestSelectionScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedInterests, setSelectedInterests } = useLocalAppState();
  const options = ['Events', 'Volunteering', 'Sports', 'Faith Talks', 'Networking', 'Mentorship'];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
      return;
    }

    setSelectedInterests([...selectedInterests, interest]);
  };

  return (
    <ScreenLayout>
      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
        <StepIndicator current={2} />

        <View style={{ marginTop: theme.spacing.md }}>
          <ScreenHeader
            title="Pick Your Interests"
            subtitle="Choose what you care about — we'll surface matching societies and events."
          />
        </View>

        <View style={[styles.chipWrap, { marginTop: theme.spacing.xl }]}>
          {options.map((opt) => (
            <InterestChip
              key={opt}
              label={opt}
              selected={selectedInterests.includes(opt)}
              onPress={() => toggleInterest(opt)}
            />
          ))}
        </View>

        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, marginTop: theme.spacing.lg }]}>
          {selectedInterests.length === 0
            ? 'Nothing selected yet — you can always update this later in Settings.'
            : `${selectedInterests.length} selected · update anytime in Settings.`}
        </Text>

        <View style={[styles.footer, { paddingTop: theme.spacing.xl }]}>
          <PrimaryButton label="Save Interests" size="lg" onPress={() => navigation.replace('MainTabs')} />
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 18,
    borderWidth: 1
  },
  footer: {
    marginTop: 'auto'
  }
});
