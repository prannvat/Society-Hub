import React from 'react';
import { Pressable, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type TextButtonProps = {
  label: string;
  onPress?: () => void;
};

export const TextButton = ({ label, onPress }: TextButtonProps) => {
  const theme = useAppTheme();
  return (
    <Pressable onPress={onPress}>
      <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
};
