import React from 'react';
import { Pressable, StyleSheet, Text, Platform } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export const PrimaryButton = ({ label, onPress, disabled = false }: PrimaryButtonProps) => {
  const theme = useAppTheme();

  return (
    <Pressable
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: 100,
          opacity: disabled ? 0.5 : pressed && Platform.OS === 'ios' ? 0.9 : 1,
          transform: [{ scale: pressed && !disabled ? 0.995 : 1 }]
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: theme.colors.background }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    includeFontPadding: false
  }
});
