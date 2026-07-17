import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
  size?: 'display' | 'h1';
  /** Self-applies the standard screen gutter. Turn off when a parent already pads horizontally. */
  gutter?: boolean;
};

export const ScreenHeader = ({ title, subtitle, accessory, size = 'h1', gutter = true }: ScreenHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.row, gutter ? { paddingHorizontal: spacing.lg } : null]}>
      <View style={styles.textWrap}>
        <Text
          style={[size === 'display' ? theme.typography.display : theme.typography.h1, { color: theme.colors.textPrimary }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[theme.typography.caption, styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  textWrap: {
    flex: 1
  },
  subtitle: {
    marginTop: 4
  },
  accessory: {
    flexShrink: 0,
    paddingTop: 4
  }
});
