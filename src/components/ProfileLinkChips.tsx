import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from '@/components/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { UserLink } from '@/services/api/users';
import { linkDisplayLabel, platformMeta } from '@/utils/linkPlatforms';

type ProfileLinkChipsProps = {
  links: UserLink[];
};

/**
 * A wrapping row of tappable link chips — the "socials" strip on a profile.
 * Renders nothing when there are no links, so an empty profile stays clean.
 */
export const ProfileLinkChips = ({ links }: ProfileLinkChipsProps) => {
  const theme = useAppTheme();
  const toast = useToast();

  if (links.length === 0) {
    return null;
  }

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        toast.show("That link can't be opened on this device.", 'error');
        return;
      }
      await Linking.openURL(url);
    } catch {
      toast.show("That link can't be opened on this device.", 'error');
    }
  };

  return (
    <View style={styles.row}>
      {links.map((link) => {
        const meta = platformMeta(link.platform);
        const label = linkDisplayLabel(link);
        return (
          <Pressable
            key={link.id}
            onPress={() => { void openLink(link.url); }}
            accessibilityRole="link"
            accessibilityLabel={`Open ${label}`}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surfaceSunken,
                borderColor: pressed ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <MaterialIcons name={meta.icon} size={16} color={theme.colors.primary} />
            <Text
              style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '100%',
  },
});
