import React from 'react';
import { Pressable, StyleProp, Text, TextStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type TextButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<TextStyle>;
};

export const TextButton = ({ label, onPress, disabled = false, style }: TextButtonProps) => {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8}>
      {({ pressed }) => (
        <Text
          style={[
            theme.typography.bodyMedium,
            {
              color: theme.colors.primary,
              opacity: disabled ? 0.45 : pressed ? 0.6 : 1
            },
            style
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};
