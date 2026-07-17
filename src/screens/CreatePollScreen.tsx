import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Run a poll as the active society. */
export const CreatePollScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const { createPoll, activeSocietyId } = useLocalAppState();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const setOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
    setError(undefined);
  };

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
            <View style={{ flex: 1 }}>
              <InputField placeholder={`Option ${i + 1}`} value={opt} onChangeText={(v) => setOption(i, v)} />
            </View>
            {options.length > 2 ? (
              <Pressable onPress={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))} hitSlop={10}>
                <MaterialIcons name="remove-circle-outline" size={24} color={theme.colors.textTertiary} />
              </Pressable>
            ) : null}
          </View>
        ))}
        {options.length < 6 ? (
          <TextButton label="Add option" onPress={() => setOptions((prev) => [...prev, ''])} />
        ) : null}

        {error ? (
          <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton label="Publish poll" onPress={submit} loading={submitting} icon="how-to-vote" />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
