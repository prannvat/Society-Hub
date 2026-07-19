import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { haptics } from '@/utils/haptics';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_OPTIONS = 6;

/** Run a poll as the active society. */
export const CreatePollScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const { createPoll, activeSocietyId, allSocieties } = useLocalAppState();

  const activeSociety = allSocieties.find((s) => s.id === activeSocietyId);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const setOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
    setError(undefined);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setError(undefined);
  };

  const addOption = () => setOptions((prev) => (prev.length < MAX_OPTIONS ? [...prev, ''] : prev));

  const submit = async () => {
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) {
      setError('Add a question.');
      return;
    }
    if (cleaned.length < 2) {
      setError('Add at least two options.');
      return;
    }
    setSubmitting(true);
    try {
      await createPoll({ societyId: activeSocietyId, question: question.trim(), options: cleaned });
      haptics.success();
      toast.show('Poll published', 'success');
      navigation.goBack();
    } catch {
      toast.show('Could not publish your poll. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <TopNavBar title="New poll" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        {activeSociety ? (
          <View style={[styles.context, { backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.card }]}>
            <Avatar name={activeSociety.name} url={activeSociety.logoUrl ?? undefined} size={28} />
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>POSTING TO</Text>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {activeSociety.name}
              </Text>
            </View>
          </View>
        ) : null}

        <InputField
          label="Question"
          placeholder="What do you want to ask?"
          value={question}
          onChangeText={(v) => {
            setQuestion(v);
            setError(undefined);
          }}
          multiline
        />

        <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
          Options
        </Text>
        {options.map((opt, i) => (
          <View key={i} style={styles.optionRow}>
            <View style={[styles.number, { backgroundColor: theme.colors.primarySoft }]}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <InputField placeholder={`Option ${i + 1}`} value={opt} onChangeText={(v) => setOption(i, v)} />
            </View>
            {options.length > 2 ? (
              <Pressable onPress={() => removeOption(i)} hitSlop={10} style={styles.remove}>
                <MaterialIcons name="remove-circle-outline" size={24} color={theme.colors.textTertiary} />
              </Pressable>
            ) : (
              <View style={styles.remove} />
            )}
          </View>
        ))}

        {options.length < MAX_OPTIONS ? (
          <Pressable
            onPress={addOption}
            android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
            style={({ pressed }) => [
              styles.ghostRow,
              {
                borderColor: theme.colors.borderStrong,
                borderRadius: theme.radius.input,
                backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent',
              },
            ]}
          >
            <MaterialIcons name="add" size={20} color={theme.colors.primary} />
            <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>Add option</Text>
          </Pressable>
        ) : null}

        {error ? (
          <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}

        <View style={styles.publish}>
          <PrimaryButton label="Publish poll" onPress={submit} loading={submitting} icon="how-to-vote" />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, marginTop: spacing.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  number: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  remove: { width: 24, alignItems: 'center', justifyContent: 'center' },
  ghostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  publish: { marginTop: spacing.xl },
});
