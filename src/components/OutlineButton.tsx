import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type OutlineButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const OutlineButton = ({ label, onPress, disabled = false, style }: OutlineButtonProps) => {
  const theme = useAppTheme();

  return (
    <Pressable
      android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: pressed && !disabled ? theme.colors.primary : theme.colors.borderStrong,
          borderRadius: theme.radius.pill,
          backgroundColor: pressed && !disabled ? theme.colors.primarySoft : theme.colors.surface,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }]
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.text, { color: theme.colors.primary }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false
  }
});
