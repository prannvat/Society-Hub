import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { FeedSociety, formatRelativeTime } from '@/hooks/useFeed';
import { useAppTheme } from '@/hooks/useAppTheme';

type FeedCardHeaderProps = {
  society: FeedSociety;
  createdAtIso: string;
  onPressSociety: () => void;
  /** Optional trailing element — a kind chip, overflow control, etc. */
  trailing?: ReactNode;
};

/**
 * The society identity row shared by every feed card: a brand-ringed avatar,
 * the society name, and a relative timestamp. Tapping it opens the society.
 */
export const FeedCardHeader = ({ society, createdAtIso, onPressSociety, trailing }: FeedCardHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPressSociety}
        hitSlop={6}
        style={({ pressed }) => [styles.identity, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={[styles.ring, { borderColor: society.primaryColor }]}>
          <Avatar name={society.name} url={society.logoUrl ?? undefined} size={38} />
        </View>
        <View style={styles.text}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {society.name}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={1}>
            {formatRelativeTime(createdAtIso)}
          </Text>
        </View>
      </Pressable>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  ring: {
    padding: 2,
    borderWidth: 1.5,
    borderRadius: 40
  },
  text: {
    flex: 1
  },
  trailing: {
    flexShrink: 0
  }
});
