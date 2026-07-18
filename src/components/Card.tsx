import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  onPress?: () => void;
};

// Instagram-flat: content sits on the surface with a hairline, no shadow and
// only a small radius. It reads as a grouped section, not a raised card. Screens
// that want a truly borderless row can pass a style overriding borderWidth: 0.
export const Card = ({ children, style, padding = 14, onPress }: CardProps) => {
  const theme = useAppTheme();

  const baseStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      padding,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border
    },
    style
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
        style={({ pressed }) => [...baseStyle, { opacity: pressed ? 0.65 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    width: '100%'
  }
});
