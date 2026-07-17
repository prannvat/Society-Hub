import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type BadgeChipProps = {
  label: string;
  variant?: 'filled' | 'outlined';
  style?: StyleProp<ViewStyle>;
};

export const BadgeChip = ({ label, variant = 'filled', style }: BadgeChipProps) => {
  const theme = useAppTheme();
  const isFilled = variant === 'filled';

  return (
    <View
      style={[
        styles.chip,
        {
          borderColor: theme.colors.primary,
          backgroundColor: isFilled ? theme.colors.primary : 'transparent'
        },
        style
      ]}
    >
      <Text
        style={{ color: isFilled ? theme.colors.background : theme.colors.primary, fontSize: 12, fontWeight: '600' }}
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
    borderRadius: 100,
    minHeight: 30,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    justifyContent: 'center'
  }
});
