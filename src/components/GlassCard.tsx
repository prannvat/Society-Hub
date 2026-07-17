import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Deprecated — kept for backward compatibility; the card is now an opaque elevated surface. */
  intensity?: number;
};

export const GlassCard = ({ children, style }: GlassCardProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        theme.elevation.e2,
        {
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 18,
    borderWidth: 1
  }
});
