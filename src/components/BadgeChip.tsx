import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export type BadgeChipVariant = 'filled' | 'outlined' | 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type BadgeChipProps = {
  label: string;
  variant?: BadgeChipVariant;
  style?: StyleProp<ViewStyle>;
};

export const BadgeChip = ({ label, variant = 'filled', style }: BadgeChipProps) => {
  const theme = useAppTheme();

  const palette: Record<BadgeChipVariant, { background: string; text: string; border: string }> = {
    filled: {
      background: theme.colors.primary,
      text: theme.colors.textOnPrimary,
      border: theme.colors.primary
    },
    outlined: {
      background: 'transparent',
      text: theme.colors.textPrimary,
      border: theme.colors.borderStrong
    },
    neutral: {
      background: theme.colors.surfaceSunken,
      text: theme.colors.textSecondary,
      border: 'transparent'
    },
    primary: {
      background: theme.colors.primarySoft,
      text: theme.colors.primary,
      border: 'transparent'
    },
    // success/warning render neutral: a premium monochrome UI reserves colour
    // for actions and genuinely destructive states, not status decoration.
    success: {
      background: theme.colors.surfaceSunken,
      text: theme.colors.textSecondary,
      border: 'transparent'
    },
    warning: {
      background: theme.colors.surfaceSunken,
      text: theme.colors.textSecondary,
      border: 'transparent'
    },
    danger: {
      background: theme.colors.dangerSoft,
      text: theme.colors.danger,
      border: 'transparent'
    }
  };

  const colors = palette[variant];

  return (
    <View
      style={[
        styles.chip,
        {
          borderRadius: theme.radius.pill,
          borderColor: colors.border,
          backgroundColor: colors.background
        },
        style
      ]}
    >
      <Text
        style={[theme.typography.captionMedium, { color: colors.text, fontSize: 12 }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    minHeight: 30,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    justifyContent: 'center'
  }
});
