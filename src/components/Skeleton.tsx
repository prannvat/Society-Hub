import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Self-contained animation exception: a tiny opacity pulse.
export const Skeleton = ({ width = '100%', height = 14, radius = 6, circle = false, style }: SkeletonProps) => {
  const theme = useAppTheme();
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const side = circle ? height : undefined;

  return (
    <Animated.View
      style={[
        {
          width: circle ? side : width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor: theme.colors.surfaceSunken,
          opacity
        },
        style
      ]}
    />
  );
};
