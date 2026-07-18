import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  LinkPlatform,
  MAX_LINK_LABEL_LENGTH,
  MAX_USER_LINKS,
  UserLinkInput,
  validateLinkUrl,
} from '@/services/api/users';
import { LINK_PLATFORM_ORDER, linkDisplayLabel, platformMeta } from '@/utils/linkPlatforms';

type ProfileLinksEditorProps = {
  links: UserLinkInput[];
  onChange: (links: UserLinkInput[]) => void;
};

/**
 * The "add your socials" surface. Presents every known platform as an icon
 * option so it's obvious at a glance what can go here, plus an "Other" escape
 * hatch that requires a custom label. Order in the list is the display order.
 */
export const ProfileLinksEditor = ({ links, onChange }: ProfileLinksEditorProps) => {
  const theme = useAppTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [draftPlatform, setDraftPlatform] = useState<LinkPlatform>('instagram');
  const [draftLabel, setDraftLabel] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isFull = links.length >= MAX_USER_LINKS;

  const urlError = validateLinkUrl(draftUrl);
  const labelError =
    draftPlatform === 'other' && draftLabel.trim().length === 0
      ? 'Give this link a name.'
      : draftPlatform === 'other' && draftLabel.trim().length > MAX_LINK_LABEL_LENGTH
        ? `Keep it under ${MAX_LINK_LABEL_LENGTH} characters.`
        : null;

  const resetDraft = () => {
    setDraftPlatform('instagram');
    setDraftLabel('');
    setDraftUrl('');
    setSubmitted(false);
  };

  const closeSheet = () => {
    setIsAdding(false);
    resetDraft();
  };

  const confirmAdd = () => {
    setSubmitted(true);
    if (urlError || labelError) {
      return;
    }
    onChange([
      ...links,
      {
        platform: draftPlatform,
        label: draftPlatform === 'other' ? draftLabel.trim() : null,
        url: draftUrl.trim(),
      },
    ]);
    closeSheet();
  };

  const removeAt = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      {links.length === 0 ? (
        <View style={[styles.emptyHint, { backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.card }]}>
          <MaterialIcons name="add-link" size={22} color={theme.colors.primary} />
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]}>
            Add your Instagram, Snapchat, TikTok or anything else you want people to find you on.
          </Text>
        </View>
      ) : null}

      {links.map((link, index) => {
        const meta = platformMeta(link.platform);
        return (
          <View
            key={`${link.platform}-${link.url}-${index}`}
            style={[
              styles.row,
              { borderColor: theme.colors.border, borderRadius: theme.radius.card },
            ]}
          >
            <View style={[styles.iconBubble, { backgroundColor: theme.colors.primarySoft }]}>
              <MaterialIcons name={meta.icon} size={18} color={theme.colors.primary} />
            </View>

            <View style={styles.rowText}>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {linkDisplayLabel(link)}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                {link.url}
              </Text>
            </View>

            <Pressable
              onPress={() => move(index, -1)}
              disabled={index === 0}
              accessibilityRole="button"
              accessibilityLabel={`Move ${linkDisplayLabel(link)} up`}
              hitSlop={6}
              style={({ pressed }) => [styles.iconButton, { opacity: index === 0 ? 0.25 : pressed ? 0.5 : 1 }]}
            >
              <MaterialIcons name="keyboard-arrow-up" size={22} color={theme.colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => move(index, 1)}
              disabled={index === links.length - 1}
              accessibilityRole="button"
              accessibilityLabel={`Move ${linkDisplayLabel(link)} down`}
              hitSlop={6}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: index === links.length - 1 ? 0.25 : pressed ? 0.5 : 1 },
              ]}
            >
              <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => removeAt(index)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${linkDisplayLabel(link)}`}
              hitSlop={6}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <MaterialIcons name="close" size={20} color={theme.colors.danger} />
            </Pressable>
          </View>
        );
      })}

      <PrimaryButton
        label={isFull ? `Maximum ${MAX_USER_LINKS} links` : 'Add link'}
        variant="secondary"
        size="md"
        icon="add"
        disabled={isFull}
        onPress={() => setIsAdding(true)}
      />

      <Modal visible={isAdding} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} onPress={closeSheet}>
          {/* Stop taps inside the sheet from dismissing it. */}
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
            onPress={() => undefined}
          >
            <View style={styles.sheetHeader}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Add a link</Text>
              <Pressable onPress={closeSheet} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <MaterialIcons name="close" size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetBody}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
                Platform
              </Text>
              <View style={styles.platformGrid}>
                {LINK_PLATFORM_ORDER.map((platform) => {
                  const meta = platformMeta(platform);
                  const selected = platform === draftPlatform;
                  return (
                    <Pressable
                      key={platform}
                      onPress={() => setDraftPlatform(platform)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={meta.name}
                      style={({ pressed }) => [
                        styles.platformOption,
                        {
                          borderRadius: theme.radius.card,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                          backgroundColor: selected
                            ? theme.colors.primarySoft
                            : pressed
                              ? theme.colors.surfaceSunken
                              : 'transparent',
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={meta.icon}
                        size={20}
                        color={selected ? theme.colors.primary : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          theme.typography.caption,
                          { color: selected ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {meta.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {draftPlatform === 'other' ? (
                <InputField
                  label={`Label (${draftLabel.trim().length}/${MAX_LINK_LABEL_LENGTH})`}
                  placeholder="e.g. Goodreads"
                  value={draftLabel}
                  onChangeText={setDraftLabel}
                  icon="label"
                  error={submitted && labelError ? labelError : undefined}
                />
              ) : null}

              <InputField
                label="URL"
                placeholder={platformMeta(draftPlatform).urlHint}
                value={draftUrl}
                onChangeText={setDraftUrl}
                icon="link"
                autoCapitalize="none"
                error={submitted && urlError ? urlError : undefined}
              />

              <PrimaryButton label="Add link" icon="check" onPress={confirmAdd} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  iconButton: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetBody: {
    gap: 14,
    paddingBottom: 12,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformOption: {
    width: '31.5%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderWidth: 1,
    minHeight: 66,
  },
});
