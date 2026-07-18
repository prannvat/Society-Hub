import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { useAppTheme } from '@/hooks/useAppTheme';

type ProfileIdentityBlockProps = {
  fullName: string;
  /** Rendered as `@username`. Omit when the user has not picked a handle. */
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  /** e.g. `Physics · Year 1` — already-joined caption line. */
  caption?: string | null;
  isVerifiedStudent?: boolean;
  /** Rendered to the right of the avatar — typically a ProfileStatsRow. */
  trailing?: React.ReactNode;
};

const AVATAR_SIZE = 92;

/**
 * The shared top-of-profile identity block, used by both your own profile and
 * anyone else's so the two read as the same object. Instagram's rhythm: a large
 * circular avatar beside the stats, then name / @handle / caption / bio below.
 */
export const ProfileIdentityBlock = ({
  fullName,
  username,
  avatarUrl,
  bio,
  caption,
  isVerifiedStudent = false,
  trailing,
}: ProfileIdentityBlockProps) => {
  const theme = useAppTheme();
  const displayName = fullName.trim().length > 0 ? fullName : 'Unnamed student';

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Avatar name={displayName} size={AVATAR_SIZE} url={avatarUrl ?? undefined} />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      <View style={styles.textBlock}>
        <View style={styles.nameRow}>
          <Text
            style={[theme.typography.h2, { color: theme.colors.textPrimary, flexShrink: 1 }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {isVerifiedStudent ? (
            <MaterialIcons
              name="verified"
              size={18}
              color={theme.colors.primary}
              accessibilityLabel="Verified student"
            />
          ) : null}
        </View>

        {username ? (
          <Text
            style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            @{username}
          </Text>
        ) : null}

        {caption ? (
          <Text
            style={[theme.typography.caption, { color: theme.colors.textTertiary }]}
            numberOfLines={2}
          >
            {caption}
          </Text>
        ) : null}

        {bio && bio.trim().length > 0 ? (
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginTop: 4 }]}>
            {bio.trim()}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trailing: {
    flex: 1,
  },
  textBlock: {
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
