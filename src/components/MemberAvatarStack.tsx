import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PublicSocietyMember } from '@/services/api/types';

type MemberAvatarStackProps = {
  members: PublicSocietyMember[];
  /** Total membership, so the overflow copy can read "and N others". */
  total: number;
  onPress: () => void;
};

const AVATAR_SIZE = 34;
const OVERLAP = 11;

/**
 * Social proof: a few overlapping member faces that tap through to the full
 * member list. Renders nothing when there is nobody to show.
 */
export const MemberAvatarStack = ({ members, total, onPress }: MemberAvatarStackProps) => {
  const theme = useAppTheme();

  if (members.length === 0) {
    return null;
  }

  const shown = members.slice(0, 5);
  const others = Math.max(total - shown.length, 0);
  const lead = shown[0].user.fullName.split(' ')[0];
  const summary =
    others > 0
      ? `${lead} and ${others} ${others === 1 ? 'other' : 'others'} joined`
      : `${shown.length} ${shown.length === 1 ? 'member' : 'members'} joined`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${summary}. View all members.`}
      android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
      style={({ pressed }) => [
        styles.wrap,
        {
          borderRadius: theme.radius.pill,
          backgroundColor: pressed ? theme.colors.surfaceSunken : theme.colors.surface,
          borderColor: theme.colors.border
        }
      ]}
    >
      <View style={styles.stack}>
        {shown.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.avatarSlot,
              {
                marginLeft: index === 0 ? 0 : -OVERLAP,
                borderColor: theme.colors.surface,
                borderRadius: (AVATAR_SIZE + 4) / 2,
                zIndex: shown.length - index
              }
            ]}
          >
            <Avatar name={member.user.fullName} size={AVATAR_SIZE} url={member.user.avatarUrl ?? undefined} />
          </View>
        ))}
      </View>
      <Text style={[theme.typography.captionMedium, styles.summary, { color: theme.colors.textPrimary }]} numberOfLines={1}>
        {summary}
      </Text>
      <MaterialIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarSlot: {
    borderWidth: 2
  },
  summary: {
    flex: 1
  }
});
