import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export type ProfileStat = {
  label: string;
  value: string | number;
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
        <View key={stat.label} style={styles.cell}>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {stat.value}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {stat.label}
          </Text>
        </View>
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
    gap: 2,
    flex: 1
  }
});
