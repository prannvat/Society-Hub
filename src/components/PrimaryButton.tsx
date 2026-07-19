import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts } from '@/config/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

const sizeStyles: Record<ButtonSize, { minHeight: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  lg: { minHeight: 52, paddingHorizontal: 24, fontSize: 16, iconSize: 20 },
  md: { minHeight: 44, paddingHorizontal: 18, fontSize: 15, iconSize: 18 },
  sm: { minHeight: 36, paddingHorizontal: 14, fontSize: 13, iconSize: 16 }
};

export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
  style
}: PrimaryButtonProps) => {
  const theme = useAppTheme();
  const dims = sizeStyles[size];
  const inert = disabled || loading;

  const palette = {
    primary: {
      background: theme.colors.primary,
      pressed: theme.colors.primaryPressed,
      label: theme.colors.textOnPrimary
    },
    secondary: {
      background: theme.colors.surfaceSunken,
      pressed: theme.colors.border,
      label: theme.colors.textPrimary
    },
    ghost: {
      background: 'transparent',
      pressed: theme.colors.primarySoft,
      label: theme.colors.primary
    },
    danger: {
      background: theme.colors.danger,
      pressed: theme.colors.danger,
      label: '#FFFFFF'
    }
  }[variant];

  return (
    <Pressable
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: dims.minHeight,
          paddingHorizontal: dims.paddingHorizontal,
          backgroundColor: pressed && !inert ? palette.pressed : palette.background,
          borderRadius: theme.radius.input,
          opacity: disabled ? 0.45 : pressed && !inert && variant !== 'primary' ? 0.7 : 1
        },
        style
      ]}
      onPress={onPress}
      disabled={inert}
      // The label lives on the Pressable, not just the child Text, so the button
      // is still announced while `loading` swaps the label for a spinner.
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inert, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.label} />
      ) : (
        <View style={styles.content}>
          {icon ? <MaterialIcons name={icon} size={dims.iconSize} color={palette.label} /> : null}
          <Text
            style={[styles.text, { fontFamily: fonts.sansSemibold, fontSize: dims.fontSize, color: palette.label }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  text: {
    fontWeight: '600',
    includeFontPadding: false
  }
});
