import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export type ProfileStat = {
  label: string;
  value: string | number;
  /** When set the cell becomes tappable (e.g. Members → the member list). */
  onPress?: () => void;
};

type ProfileStatsRowProps = {
  stats: ProfileStat[];
};

/**
 * Instagram-style horizontal stats group (value stacked over label), the
 * "posts / followers / following" rhythm. Shared across the personal, society,
 * and member profiles so every profile reads the same.
 */
export const ProfileStatsRow = ({ stats }: ProfileStatsRowProps) => {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <Pressable
          key={stat.label}
          onPress={stat.onPress}
          disabled={!stat.onPress}
          accessibilityRole={stat.onPress ? 'button' : undefined}
          accessibilityLabel={stat.onPress ? `${stat.value} ${stat.label}` : undefined}
          style={({ pressed }) => [styles.cell, { opacity: pressed && stat.onPress ? 0.6 : 1 }]}
        >
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {stat.value}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              { color: stat.onPress ? theme.colors.primary : theme.colors.textSecondary }
            ]}
            numberOfLines={1}
          >
            {stat.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end'
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
    minHeight: 44
  }
});
