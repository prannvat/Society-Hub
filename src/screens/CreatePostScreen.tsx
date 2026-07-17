import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '@/components/Avatar';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { AnnouncementCategory } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: AnnouncementCategory[] = ['General', 'Events', 'Important', 'Committee'];

/** Post an update as the active society. Reached from the create hub / society manage. */
export const CreatePostScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const { addAnnouncement, allSocieties, activeSocietyId } = useLocalAppState();

  const activeSociety = allSocieties.find((s) => s.id === activeSocietyId);

  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('General');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; preview?: string }>({});

  const submit = async () => {
    const nextErrors: { title?: string; preview?: string } = {};
    if (!title.trim()) nextErrors.title = 'Give your post a title.';
    if (!preview.trim()) nextErrors.preview = 'Add some content.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await addAnnouncement({ title: title.trim(), preview: preview.trim(), category });
      toast.show('Post published', 'success');
      navigation.goBack();
    } catch {
      toast.show('Could not publish your post. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <TopNavBar title="New post" onBack={() => navigation.goBack()} />
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
          label="Title"
          placeholder="What's the headline?"
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            setErrors((e) => ({ ...e, title: undefined }));
          }}
          error={errors.title}
        />
        <InputField
          label="Content"
          placeholder="Share the details with your members…"
          value={preview}
          onChangeText={(v) => {
            setPreview(v);
            setErrors((e) => ({ ...e, preview: undefined }));
          }}
          error={errors.preview}
          multiline
        />

        <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
          Category
        </Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const selected = c === category;
            return (
              <Text
                key={c}
                onPress={() => setCategory(c)}
                suppressHighlighting
                style={[
                  theme.typography.captionMedium,
                  styles.chip,
                  {
                    borderRadius: theme.radius.pill,
                    color: selected ? theme.colors.textOnPrimary : theme.colors.textSecondary,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                {c}
              </Text>
            );
          })}
        </View>

        <View style={styles.publish}>
          <PrimaryButton label="Publish post" onPress={submit} loading={submitting} icon="send" />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, overflow: 'hidden' },
  publish: { marginTop: spacing.xl },
});
