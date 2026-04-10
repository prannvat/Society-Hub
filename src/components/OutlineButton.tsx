import React from 'react';
import { Pressable, StyleSheet, Text, Platform } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type OutlineButtonProps = {
  label: string;
  onPress?: () => void;
};

export const OutlineButton = ({ label, onPress }: OutlineButtonProps) => {
  const theme = useAppTheme();

  return (
    <Pressable
      android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: theme.colors.primary,
          borderRadius: 100,
          opacity: pressed && Platform.OS === 'ios' ? 0.9 : 1,
          backgroundColor: pressed ? theme.colors.surface : 'transparent'
        }
      ]}
      onPress={onPress}
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
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '700',
    includeFontPadding: false
  }
});
